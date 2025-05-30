import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { i } from 'node_modules/@angular/cdk/data-source.d-7cab2c9d';

@Injectable({
  providedIn: 'root'
})
export class ImmunizationService {

  private apiUrls = {
    immunization: (patientId: string) => `patient-api/patients/${patientId}/immunizations`,
    master: () => 'master-api/master',
  }
  private apiService = inject(ApiService);

  constructor() { }

  searchVaccine<T>(searchParam: string): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/vaccines/search', { params: { searchParam } });
  }

  getAllFrequentlyUsedVaccines<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/vaccines/frequentlyused');
  }

  getImmunizations<T>(patientId: string, appointmentId?: string): Observable<T> {
    const params = appointmentId ? { appointmentId } : {}
    return this.apiService.get(this.apiUrls.immunization(patientId), { params });
  }

  addImmunization<T>(patientId: string, immunization): Observable<T> {
    return this.apiService.post(this.apiUrls.immunization(patientId), immunization);
  }

  updateImmunization<T>(patientId: string, immunizationId: string, immunization): Observable<T> {
    return this.apiService.put(`${this.apiUrls.immunization(patientId)}/${immunizationId}`, immunization);
  }
}
