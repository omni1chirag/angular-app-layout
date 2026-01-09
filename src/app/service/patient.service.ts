import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { CreatePatient, OptForUserOtpDTO, PatientConsentOTP, PatientOptForUser } from '@interface/patient-profile.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  isPatientUpdated = signal<boolean>(false);

  private readonly apiService = inject(ApiService);

  private readonly apiUrls = {
    patient: 'patient-api/patients',
  }

  savePatient<T>(patient: CreatePatient): Observable<T> {
    return this.apiService.post<T>(this.apiUrls.patient, patient);
  }

  updatePatient<T>(patientId: string, patient: CreatePatient): Observable<T> {
    return this.apiService.put<T>(`${this.apiUrls.patient}/${patientId}`, patient, { needFullResponse: true });
  }

  getPatient<T>(patientId: string): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.patient}/${patientId}`)
  }

  sendConsentOtp<T>(data: PatientConsentOTP): Observable<T> {
    return this.apiService.post<T>(`${this.apiUrls.patient}/send-consent-otp`, data);
  }

  optForUser<T>(patientId: string, data: PatientOptForUser): Observable<T> {
    return this.apiService.patch<T>(`${this.apiUrls.patient}/${patientId}/opt-for-user`, data);
  }

  sendOPTForUserOTP<T>(data: OptForUserOtpDTO): Observable<T> {
    return this.apiService.post<T>(`${this.apiUrls.patient}/send-opt-for-user-otp`, data);
  }

  getProfilesByPhoneNumber<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.patient}/profiles/by-phone-number`, { params })
  }

  getCityByPatientId<T>(patientId: string): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.patient}/${patientId}/city`)
  }

  searchPatients<T>(searchParams: string): Observable<T> {
    const params = new HttpParams().append('name', searchParams);
    return this.apiService.get<T>(`${this.apiUrls.patient}/search`, { params });
  }

  getLastVisitedDoctors<T>(patientId: string, limit: number): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.patient}/${patientId}/doctors/last-visited`, {params: {limit}});
  }
}
