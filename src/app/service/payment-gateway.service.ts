import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Appointment } from '@interface/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
private readonly apiUrls = {
    paymentGateway: 'ebplp-api/payment-gateway'
  };
  private readonly apiService = inject(ApiService);

  createAppointmentOrder<T>(payload: Appointment): Observable<T> {
    return this.apiService.post<T>(`${this.apiUrls.paymentGateway}/appointment-order`, payload); 
  }
}
