import { HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isMemberAdded = signal<boolean>(false);
  isProfileChanged = signal<boolean>(false);

  private readonly apiUrls = {
    user: 'ebplp-api/users',
    getOrganizationLabels: 'ebplp-api/organizations/labels',
    getClinicLabels: 'ebplp-api/clinics/labels/',
    getRoleLabels: 'ebplp-api/roles/labels',
}

  private readonly apiService = inject(ApiService);

  getRoleLabels<T>(): Observable<T> {
    return this.apiService.get<T>(this.apiUrls.getRoleLabels)
  }

  getOrganizationLabels<T>(): Observable<T> {
    return this.apiService.get<T>(this.apiUrls.getOrganizationLabels)
  }

  getClinicLabels<T>(organizationId: string): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getClinicLabels}${organizationId}`)
  }

  getUser<T>(userId: string): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.user}/${userId}`)
  }

  updateActivePatientProfile<T>(userId: string, data: { patientId: string }): Observable<T> {
    return this.apiService.patch<T>(`${this.apiUrls.user}/${userId}/active-patient`, data);
  }

  getUserProfiles<T>(): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.user}/profiles`);
  }

  sendProfileFetchOTP<T>(mobileNumber: string): Observable<T> {
    const params = new HttpParams().append('mobileNumber', mobileNumber);
    return this.apiService.get<T>(`${this.apiUrls.user}/send-profile-fetch-otp`, { params });
  }
}
