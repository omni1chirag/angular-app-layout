import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientLabService {

  private apiUrls = {
    labOrder: (patientId: string) => `patient-api/patients/${patientId}/patientLabOrder`,
    labOrderById: (patientId: string, labId: string) =>
      `patient-api/patients/${patientId}/patientLabOrder/${labId}`,    
    master: () => 'master-api/master',
    appointment: 'patient-api/appointments',
  }
  private apiService = inject(ApiService);
  constructor() { }

  createLabOrder<T>(labId: string, labOrder: any): Observable<T> {
    return this.apiService.post(this.apiUrls.labOrder(labId), labOrder);
  }

  updateLabOrder<T>(labId: string, labOrderId: string, labOrder: any): Observable<T> {
    return this.apiService.put(`${this.apiUrls.labOrder(labId)}/${labOrderId}`, labOrder);
  }

  getAppointmentLabels<T>(params): Observable<T> {
    return this.apiService.get(`${this.apiUrls.appointment}/labels`, { params })
  }

  getAllLabs<T>(patientId, params?): Observable<T> {
    return this.apiService.get(this.apiUrls.labOrder(patientId), { params });
  }

  getLabOrderById<T>(patientId: string, labId: string): Observable<T> {
    return this.apiService.get(this.apiUrls.labOrderById(patientId, labId));
  }  

}
