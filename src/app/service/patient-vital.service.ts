import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { PatientVitalRequest } from '@interface/vital-interface';
@Injectable({
  providedIn: 'root'
})
export class PatientVitalService {

  private readonly apiUrls = {
    vitalOrder: (patientId: string) => `patient-api/patients/${patientId}/vitals`,
    vitals: 'patient-api/vitals/todays-readings',
    vitalOrderList: (patientId: string) => `patient-api/vitals/patients/${patientId}`,
    appointment: 'patient-api/appointments',
    vitalSetup: (userId: string) => `patient-api/users/${userId}/preferences`,
  };
  private readonly apiService = inject(ApiService);

  addVitals<T>(patientId: string, vitalsData: PatientVitalRequest): Observable<T> {
    return this.apiService.post(this.apiUrls.vitalOrder(patientId), vitalsData);
  }

  updateVitals<T>(patientId: string, vitalsId: string, vitalsData: PatientVitalRequest): Observable<T> {
    return this.apiService.put(`${this.apiUrls.vitalOrder(patientId)}/${vitalsId}`, vitalsData);
  }

  getExpandedVitals<T>(patientId: string, params?: HttpParams): Observable<T> {
    return this.apiService.get(`${this.apiUrls.vitalOrder(patientId)}/expanded`, { params });
  }

  getAllVitals<T>(patientId: string, params?: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.vitalOrder(patientId), { params });
  }

  getVitalsById<T>(patientId: string, vitalsId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.vitalOrder(patientId)}/${vitalsId}`);
  }

  savePreferences<T>(userId: string, preferencesData: Record<string, boolean>): Observable<T> {
    return this.apiService.post(this.apiUrls.vitalSetup(userId), preferencesData);
  }

  getPreferences<T>(userId: string): Observable<T> {
    return this.apiService.get(this.apiUrls.vitalSetup(userId));
  }

  getTodaysReadings<T>(): Observable<T> {
    return this.apiService.get(`${this.apiUrls.vitals}`)
  }

  getAllVitalsList<T>(patientId: string, params?: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.vitalOrderList(patientId), { params });
  }

  getFutureAppointmentLabels<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.appointment}/future-labels-with-signoff`, { params })
  }

  deleteVital<T>(patientId: string, vitalsId: string): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.vitalOrder(patientId)}/${vitalsId}`);
  }

}
