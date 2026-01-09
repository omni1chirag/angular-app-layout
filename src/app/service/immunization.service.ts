import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Immunization } from '@interface/immunization.interface';

@Injectable({
  providedIn: 'root'
})
export class ImmunizationService {

  private readonly apiUrls = {
    immunization: (patientId: string) => `patient-api/patients/${patientId}/immunizations`,
    immunizations: () => 'patient-api/immunizations',
    master: () => 'master-api/master',
  }
  private readonly apiService = inject(ApiService);

  getAllFrequentlyUsedVaccines<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/vaccines/frequentlyused');
  }

  getPatientImmunizations<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.immunization(patientId), { params });
  }

  addImmunization<T>(patientId: string, immunization: Immunization): Observable<T> {
    return this.apiService.post(this.apiUrls.immunization(patientId), immunization);
  }

  updateImmunization<T>(patientId: string, immunizationId: string, immunization: Immunization): Observable<T> {
    return this.apiService.put(`${this.apiUrls.immunization(patientId)}/${immunizationId}`, immunization);
  }

  getImmunizationById<T>(patientId: string, immunizationId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.immunization(patientId)}/${immunizationId}`);
  }

  searchVaccine<T>(searchParam: string): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/vaccines/search', { params: { searchParam } });
  }

  getAllImmunizations<T>(params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.immunizations(), { params });
  }

}
