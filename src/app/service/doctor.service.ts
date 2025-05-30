import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface Doctor {
  doctorName: string;
  specialization: string;
  practiceName: string;
  organizationName: string;
  consultationMode: string;
  Status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private apiUrls = {
    doctor: 'ebplp-api/doctors',
    getDepartmentData: 'master-api/master/department',
    getOrganizationLabels: 'ebplp-api/organizations/labels',
    getClinicLabels: 'ebplp-api/clinics/labels/',
    getRoleLabels: 'ebplp-api/roles/labels',
    createRegistrationForm: 'ebplp-api/doctorRegistrations',
  }

  constructor(private apiService: ApiService) { }

  getOrganizationLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getOrganizationLabels)
  }

  getClinicLabels<T>(organizationId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.getClinicLabels}${organizationId}`)
  }

  getDoctor<T>(doctorId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.doctor}/${doctorId}`)
  }

  saveDoctor<T>(doctor): Observable<T> {
    return this.apiService.post(this.apiUrls.doctor, doctor);
  }

  updateDoctor<T>(doctorId, doctor): Observable<T> {
    return this.apiService.put(`${this.apiUrls.doctor}/${doctorId}`, doctor);
  }

  searchDoctors<T>(searchParams: any): Observable<T> {
    let params = new HttpParams().append('doctorName', searchParams);
    return this.apiService.get(`${this.apiUrls.doctor}/search`, { params });
  }

  updateDoctorStatus(doctorId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.doctor}/${doctorId}/status`, data);
  }

  getDoctors<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.doctor, { params });
  }

  saveRegistrationform<T>(provider): Observable<T> {
    return this.apiService.post(this.apiUrls.createRegistrationForm, provider);
  }

}
