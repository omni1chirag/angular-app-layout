import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
 
  private apiUrls = {
    clinic: 'ebplp-api/clinics',
    getOrganizationLabels: 'ebplp-api/organizations/labels',
    getClinicLabels: 'ebplp-api/clinics/labels/',
  }
  constructor(private http: HttpClient,
      private apiService: ApiService) {}

  getOrganizationLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getOrganizationLabels)
  }

  createClinic<T>(clinic): Observable<T> {
    return this.apiService.post(this.apiUrls.clinic, clinic);
  }

  updateClinic<T>(clinicId, clinic): Observable<T> {  
    return this.apiService.put(`${this.apiUrls.clinic}/${clinicId}`, clinic);
  }

  getClinicById<T>(clinicId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.clinic}/${clinicId}`);
  }

  getAllClinics<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.clinic,{params});
  }

  updateClinicStatus(clinicId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.clinic}/${clinicId}/status`, data);
  }

  getClinicLabels<T>(organizationId): Observable<T> {
    return this.apiService.get( `${this.apiUrls.getClinicLabels}${organizationId}`)
  }

  searchClinics<T>(query: any): Observable<T> {
    let params = new HttpParams().append('clinicName', query);
    return this.apiService.get(`${this.apiUrls.clinic}/search`, {params});
  }

}
