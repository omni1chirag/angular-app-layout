import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { OrderModel } from '@model/order.model';
import { RazorpayResponse } from './razorpay.service';
import { CustomerModel } from '@model/customer.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  get endpoints(): {
    payment: string;
    orders: string;
    customers: string;
    createOrder: string;
    capturePayment: string;
    transaction: string;
    verifyPayment: string;
    getKey: string;
    linkCustomer: (userId: string) => string;
  } {
    const payment = 'payment-api/payments';
    const orders = 'payment-api/orders';
    const customers = 'payment-api/customers';
    const users = 'ebplp-api/users';
    return {
      payment,
      orders,
      customers,
      createOrder: `${orders}/create-order`,
      capturePayment: `${payment}/capture`,
      transaction: `${payment}/verify-transaction`,
      verifyPayment: `${payment}/verify-payment`,
      getKey: `${payment}/get-key`,
      linkCustomer: (userId: string) => `${users}/${userId}/link-customer`
    }
  }

  private readonly api = inject(ApiService);


  createOrder<T>(order: OrderModel): Observable<T> {
    return this.api.post(this.endpoints.orders, order);
  }

  verifyPayment<T>(resp: RazorpayResponse): Observable<T> {
    return this.api.post(this.endpoints.verifyPayment, resp);
  }

  linkUserWithCustomer<T>(userId: string, customerId: string): Observable<T> {
    return this.api.patch(this.endpoints.linkCustomer(userId), { customerId: customerId });
  }

  createCustomer<T>(customer: CustomerModel): Observable<T> {
    return this.api.post(this.endpoints.customers, customer);
  }

  getCustomerByEmail<T>(email: string): Observable<T> {
    return this.api.get(`${this.endpoints.customers}/email/${email}`);
  }

  getCustomerById<T>(customerId: string): Observable<T> {
    return this.api.get(`${this.endpoints.customers}/${customerId}`);
  }

}
