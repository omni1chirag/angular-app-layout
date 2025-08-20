import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { OrderModel } from '@model/order.model';
import { PaymentService } from '@service/payment.service';
import { RazorpayService } from '@service/razorpay.service';
import { Customer } from '@model/customer.model';
import { LocalStorageService } from '@service/local-storage.service';

@Component({
  selector: 'app-dashboard',
  imports: [SkeletonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, InputNumberModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent{
  payNowDialogVisible = false;
  amount = 0;
  recipientId = '';
  order: OrderModel = new OrderModel();

  constructor(
    private razorpayService: RazorpayService,
    ) { }

  showDialog() {
    this.payNowDialogVisible = true;
  }

  createOrder() {
    this.order.amount = this.amount * 100;
    this.order.recipientId = this.recipientId;

    this.razorpayService.pay(this.order).subscribe({
      next: (response) => console.log('payment verified', response),
      error: (error) => console.error('Payment failed', error)
    });
  }
}
