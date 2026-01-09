import { inject, Injectable } from '@angular/core';
import { catchError, from, Observable, of, Subscriber, switchMap, tap, throwError } from 'rxjs';
import { OrderModel } from '@model/order.model';
import { PaymentService } from './payment.service';
import { CustomerModel } from '@model/customer.model';
import { LocalStorageService } from './local-storage.service';
import { WindowRef } from './window-ref.service';
import { UserProfile } from '@interface/user-profile.interface';

type RazorpayConstructor = new (options: RazorpayOptions) => {
  open: () => void;
  close: () => void;
};
export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_id: string;
  verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class RazorpayService {
  private readonly options: Partial<RazorpayOptions> = {};
  private scriptLoaded = false;
  private readonly userProfile?: UserProfile;
  private isCustomerIdLinked = false;
  private readonly windowRef = inject(WindowRef);
  private readonly paymentService = inject(PaymentService);
  private readonly localStorageService = inject(LocalStorageService);
  private successCallback?: (payment: RazorpayResponse) => void;
  private dismissCallback?: () => void;
  private currentObserver?: Subscriber<unknown>;

  constructor() {
    this.userProfile = this.localStorageService.getUserProfile();
  }

  /** Create order, configure payment, and open checkout */
  pay(order: OrderModel): Observable<unknown> {
    // 1. Create an Observable stream for the CustomerModel.
    const customerObservable$: Observable<CustomerModel> = this.userProfile
      ? this.resolveCustomer()
      : of(new CustomerModel());

    // 2. Chain the Customer resolution with the Order creation/reuse.
    return customerObservable$.pipe(
      // switchMap 1: Takes resolved CustomerModel and decides next step (Create Order or Reuse)
      switchMap((resolvedCustomer: CustomerModel) => {
        console.debug('Customer resolved before order creation:', resolvedCustomer);

        // Determine the Observable stream for the OrderModel:
        let orderModelObservable$: Observable<OrderModel>;

        if (order.razorpayId == null) {
          // Scenario A: Order ID is NOT available -> Call createOrder API directly in payment service.
          console.debug('Order ID is null. Creating new order via API.');
          orderModelObservable$ = this.paymentService.createOrder(order);
        } else {
          // Scenario B: Order ID IS available meand order is already created.
          // We wrap the existing 'order' object in an Observable 'of()'.
          console.debug('Order ID exists. Reusing existing order details.');
          orderModelObservable$ = of(order);
        }

        // Now, switch to the selected OrderModel stream (A or B)
        return orderModelObservable$.pipe(

          // switchMap 2: Takes the resolved/reused OrderModel (data) and proceeds with payment
          switchMap((resolvedOrder: OrderModel) => {
            // Use the *resolvedCustomer* data and the *resolvedOrder* data here!
            this.setKey(resolvedOrder.key)
              .setOrderId(resolvedOrder.razorpayId) // Use resolvedOrder data
              .setCustomer(resolvedCustomer)
              .setConfig(order.config)
              .onSuccess((payment) => {
                console.debug('Payment successful from razorpay service', payment);
                this.verifyPayment(payment);
              })
              .onDismiss(() => {
                console.warn('Payment dismissed from razorpay service');
              });

            return this.open();
          })
        );
      })
    );
  }

  verifyPayment(razorpayResponse: RazorpayResponse): void {
    this.paymentService.verifyPayment(razorpayResponse).subscribe({
      next: (verifiedResponse) => {
        console.debug('Payment verified successfully from razorpay service', verifiedResponse);
        this.emitVerifiedResponse(verifiedResponse);
      },
      error: (error) => {
        console.error('Payment verification failed from razorpay service', error);
        this.emitVerifiedResponse({
          success: false,
          error,
        });
      },
    });
  }

  /** Opens Razorpay checkout */
  open(): Observable<unknown> {
    return from(this.loadScript()).pipe(
      switchMap(
        () =>
          new Observable<unknown>((observer) => {
            this.currentObserver = observer; // store observer to emit later after verification
            const options: RazorpayOptions = {
              ...this.options,
              handler: (res: RazorpayResponse) => {
                if (this.successCallback) {
                  this.successCallback(res);
                }
              },
              modal: {
                ondismiss: () => {
                  console.warn('Payment modal dismissed by user');
                  if (this.dismissCallback) this.dismissCallback();
                  observer.error(new Error('dismissed'));
                },
              },
            } as RazorpayOptions;

            const rzp = new (this.windowRef.nativeWindow as { Razorpay: RazorpayConstructor }).Razorpay(options);
            rzp.open();

            return () => {
              try {
                rzp.close();
              } catch (error) {
                console.warn('Error closing Razorpay:', error);
              }
            };
          })
      )
    );
  }

  /** Load Razorpay SDK script dynamically */
  private loadScript(): Promise<void> {
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
      document.body.appendChild(script);
    });
  }

  private emitVerifiedResponse(response: unknown): void {
    if (this.currentObserver) {
      this.currentObserver.next(response);
      this.currentObserver.complete();
    } else {
      console.warn('Observer not available to emit response');
    }
  }

  setKey(key: string): this {
    this.options.key = key;
    return this;
  }

  setAmount(amount: number): this {
    this.options.amount = amount;
    return this;
  }

  setCurrency(currency: string): this {
    this.options.currency = currency;
    return this;
  }

  setOrderId(orderId: string): this {
    this.options.order_id = orderId;
    return this;
  }

  setPrefill(prefill: Record<string, string>): this {
    this.options.prefill = prefill;
    return this;
  }

  setTheme(theme: Record<string, string>): this {
    this.options.theme = theme;
    return this;
  }

  setImage(image: string): this {
    this.options.image = image;
    return this;
  }

  setName(name: string): this {
    this.options.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.options.description = description;
    return this;
  }

  setConfig(config: Config): this {
    console.debug("Setting config", config);
    this.options.config = {} as Config;
    return this;
  }


  setCustomer(customer: CustomerModel): this {
    if (customer) {
      if (customer?.id) {
        this.options.customer_id = customer.id;
        if (!this.isCustomerIdLinked) {
          this.linkCustomer(customer.id);
        }
      } else {
        this.setPrefill({ name: customer.name, email: customer.email, contact: customer.contact });
      }
    }
    return this;
  }

  onSuccess(callback: (res: RazorpayResponse) => void): this {
    this.successCallback = callback;
    return this;
  }

  onDismiss(callback: () => void): this {

    this.dismissCallback = callback;

    return this;
  }

  /** Links Razorpay customer with logged-in user */
  private linkCustomer(customerId: string): void {
    const userProfile = this.localStorageService.getUserProfile();

    if (!userProfile) {
      console.error('User profile not found in local storage');
      return;
    }

    const { userId } = userProfile;

    this.paymentService.linkUserWithCustomer(userId, customerId).subscribe({
      next: () => {
        console.debug('Customer linked successfully');
        this.isCustomerIdLinked = true;
      },
      error: (error) => {
        console.error('Failed to link customer', error);
        this.isCustomerIdLinked = false;
      },
    });
  }

  private resolveCustomer(): Observable<CustomerModel> {
    const customerId = (this.userProfile?.customerId ?? '').toString().trim();
    const userEmail = (this.userProfile?.email ?? '').toString().trim();
    const newCustomerData = this.buildNewCustomerModel();

    const fetchById$ = customerId ?
      this.paymentService.getCustomerById(customerId).pipe(
        switchMap((data: CustomerModel) => {
          console.debug('Fetched customer data by ID:', data);
          this.isCustomerIdLinked = true;
          return of(data);
        }),
        catchError(error => {
          console.error('Error fetching customer data by ID, falling back to email lookup:', error);
          return this.fetchCustomerByEmail(userEmail, newCustomerData);
        })
      ) :
      this.fetchCustomerByEmail(userEmail, newCustomerData);

    return fetchById$;
  }

  private fetchCustomerByEmail(userEmail: string, fallbackCustomer: CustomerModel): Observable<CustomerModel> {
    if (userEmail) {
      return this.paymentService.getCustomerByEmail(userEmail).pipe(
        switchMap((data: CustomerModel) => {
          console.debug('Fetched customer data by email:', data);
          this.isCustomerIdLinked = true;
          return of(data);
        }),
        catchError((error) => {
          console.error('Error fetching customer data by email, creating new customer:', error);
          return this.createCustomer(fallbackCustomer);
        })
      );
    }
    return this.createCustomer(fallbackCustomer);
  }

  private buildNewCustomerModel(): CustomerModel {
    const customer = new CustomerModel();
    customer.id = null;
    customer.name = [this.userProfile.firstName, this.userProfile.middleName, this.userProfile.lastName]
      .filter(Boolean)
      .join(' ');
    customer.email = String(this.userProfile.email ?? '').trim();
    customer.contact = this.userProfile.mobileNumber ?? '';
    customer.notes = [];
    return customer;
  }

  createCustomer(customer: CustomerModel): Observable<CustomerModel> {
    return this.paymentService.createCustomer(customer).pipe(
      tap((data: CustomerModel) => {
        console.debug('Created new customer:', data);
      }),
      catchError(error => {
        console.error('Error creating customer:', error);
        return throwError(() => error);
      })
    );
  }
}
