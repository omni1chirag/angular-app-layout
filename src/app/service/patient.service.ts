import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private apiUrls = {
    patient: 'patient-api/patients',
    patientsByPhoneNumber: 'patient-api/patients/by-phone-number',
  }

  private apiService = inject(ApiService);

  savePatient<T>(patient): Observable<T> {
    return this.apiService.post(this.apiUrls.patient, patient);
  }

  updatePatient<T>(patientId, patient): Observable<T> {
    return this.apiService.put(`${this.apiUrls.patient}/${patientId}`, patient);
  }

  getPatient<T>(patientId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patient}/${patientId}`)
  }

  getPatients<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.patient, { params });
  }

  getPatientBasicInfo<T>(patientId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patient}/${patientId}/basic-info`)
  }

  getPatientByPhoneNumber<T>(params): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patient}/by-phone-number`, { params })
  }

  mapPatientToDoctor<T>(patient): Observable<T> {
    return this.apiService.post(`${this.apiUrls.patient}/map-to-doctor`, patient);
  }

  sendConsentOtp<T>(data): Observable<T> {
    return this.apiService.post(`${this.apiUrls.patient}/send-consent-otp`, data);
  }

  searchPatients<T>(searchParams: any): Observable<T> {
    let params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.patient}/search`, { params });
  }

  searchPatientByName<T>(params): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patient}/search`, { params })
  }
}
