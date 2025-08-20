import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { OrderModel } from '@model/order.model';
import { link } from 'node:fs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  get endpoints() {
    const payment = 'payment-api/payments';
    const orders = 'payment-api/orders';
    const ebplp = 'ebplp-api/users';
    return {
      payment,
      orders,
      createOrder: `${orders}/create-order`,
      capturePayment: `${payment}/capture`,
      transaction: `${payment}/verify-transaction`,
      verifyPayment: `${payment}/verify`,
      getKey: `${payment}/get-key`,
      linkCustomer: (userId: string) => `${ebplp}/${userId}/link-customer`
    }
  }

  constructor(private api: ApiService) { }

  createOrder(order: OrderModel): Observable<any> {
    return this.api.post(this.endpoints.orders, order);
  }

  verifyTransaction(resp: any): Observable<any> {
    return this.api.post(this.endpoints.transaction, resp);
  }

  linkUserWithCustomer(userId: string, customerId: string) {
    return this.api.patch(this.endpoints.linkCustomer(userId), { customerId: customerId });
  }

}
