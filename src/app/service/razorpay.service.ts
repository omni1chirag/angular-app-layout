import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { WindowRef } from './window-ref.service';
import { from, Observable, switchMap } from 'rxjs';
import { OrderModel } from '@model/order.model';
import { PaymentService } from './payment.service';
import { Customer } from '@model/customer.model';
import { LocalStorageService } from './local-storage.service';


@Injectable({
  providedIn: 'root'
})


export class RazorpayService implements OnInit {
  private options: any = {};
  private scriptLoaded = false;
  userProfile: any;
  isCustomerIdLinked = false;

  constructor(
    private windowRef: WindowRef,
    private paymentService: PaymentService,
    private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.userProfile = this.localStorageService.getUserProfile();
  }

  private loadScript(): Promise<void> {
    if (this.scriptLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject('Razorpay SDK failed to load.');
      document.body.appendChild(script);
    });
  }

  setKey(key: string) { this.options.key = key; return this; }
  setAmount(amount: number) { this.options.amount = amount; return this; }
  setCurrency(cur: string) { this.options.currency = cur; return this; }
  setOrderId(id: string) { this.options.order_id = id; return this; }
  setPrefill(prefill: any) { this.options.prefill = prefill; return this; }
  onSuccess(callback: (res: any) => void) { this.options.handler = callback; return this; }
  onDismiss(callback: () => void) { this.options.modal = { ondismiss: callback }; return this; }
  setTheme(theme: any) { this.options.theme = theme; return this; }
  setImage(image: string) { this.options.image = image; return this; }
  setName(name: string) { this.options.name = name; return this; }
  setDescription(description: string) { this.options.description = description; return this; }
  setCustomer(customer: Customer) {
    if (customer?.id) {
      this.options.customer_id = customer.id;
      if (!this.isCustomerIdLinked) {
        this.linkCustomer(customer.id);
      }
    } else {
      this.setPrefill(customer);
    }
    return this;
  }

  open(): Observable<any> {
    return from(this.loadScript()).pipe(
      switchMap(() => new Observable(observer => {
        const rzp = new this.windowRef.nativeWindow.Razorpay(this.options);
        rzp.open();
        this.options.handler = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        if (this.options.modal?.ondismiss) {
          rzp.open();
        }
      }))
    );
  }

  pay(order: OrderModel): Observable<any> {
    const userProfile = this.localStorageService.getUserProfile();

    if (!userProfile) {
      console.warn('User profile not found in local storage');
    } else {
      order.customer = this.mapUserProfileToCustomer(userProfile, order.customer);
      console.log('customer:', order.customer);
    }

    return this.paymentService.createOrder(order).pipe(
      switchMap((resp: any) => this.setKey(resp.data.key)
        .setAmount(resp.data.amount)
        .setCurrency(resp.data.currency)
        .setOrderId(resp.data.id)
        .setCustomer(resp.data.customer)
        .onSuccess(p => this.paymentService.verifyTransaction(p).subscribe({
          next: (response) => { console.log('Payment captured successfully', response); },
          error: (error) => console.error('Payment capture failed', error)
        }))
        .onDismiss(() => console.warn('Payment dismissed'))
        .open()
      )
    );
  }

  linkCustomer(id: string) {
    const userProfile = this.localStorageService.getUserProfile();
    if (!userProfile) {
      console.error('user profile not found in local storage');
      return;
    }

    const userId = userProfile.userId;
    this.paymentService.linkUserWithCustomer(userId, id).subscribe({
      next: () => { console.log('Customer saved successfully'); this.isCustomerIdLinked = true;},
      error: (error) => {console.error('Failed to save customer', error), this.isCustomerIdLinked = false;} 
    });
  }

  private mapUserProfileToCustomer(userProfile: any, existingCustomer?: Customer): Customer {
    const customer = existingCustomer ?? new Customer();

    const customerId = (userProfile?.customerId ?? '').toString().trim();

    if (customerId) {
      customer.id = customerId;
      this.isCustomerIdLinked = true;
      return customer;
    }

    customer.id = null;
    customer.name = [userProfile.firstName, userProfile.middleName, userProfile.lastName]
      .filter(Boolean)
      .join(' ');
    customer.email = String(userProfile.email ?? '').trim();
    customer.contact = userProfile.mobileNumber ?? '';
    customer.gstin = userProfile.gstin ?? '';
    customer.notes = [];

    return customer;
  }


}



