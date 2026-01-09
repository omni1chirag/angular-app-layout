import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CreateCarePlan, CreateCarePlanTaskLogList } from '@interface/careplan.interface';

@Injectable({
  providedIn: 'root'
})
export class CarePlanService {

  private readonly apiUrls = {
    carePlan: `patient-api/care-plans`,
    patientCarePlan: (patientId: string) => `patient-api/patients/${patientId}/care-plans`,
  }

  private readonly apiService = inject(ApiService);

  getCarePlan<T>(patientId: string, carePlanId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patientCarePlan(patientId)}/${carePlanId}`)
  }

  saveCarePlan<T>(patientId: string, carePlan: CreateCarePlan): Observable<T> {
    return this.apiService.post(this.apiUrls.patientCarePlan(patientId), carePlan);
  }

  updateCarePlan<T>(patientId: string, carePlanId: string, carePlan: CreateCarePlan): Observable<T> {
    return this.apiService.put(`${this.apiUrls.patientCarePlan(patientId)}/${carePlanId}`, carePlan);
  }

  getAllPatientCarePlan<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.patientCarePlan(patientId), { params });
  }

  searchPatientCarePlans<T>(patientId: string, searchParams: string): Observable<T> {
    const params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.patientCarePlan(patientId)}/search`, { params });
  }

  getCarePlanDetails<T>(patientId: string, carePlanId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patientCarePlan(patientId)}/${carePlanId}/details`)
  }

  saveCarePlanTaskLogs<T>(patientId: string, carePlanId: string, data: CreateCarePlanTaskLogList): Observable<T> {
    return this.apiService.post(`${this.apiUrls.patientCarePlan(patientId)}/${carePlanId}/logs`, data)
  }

  getCarePlanTaskLogs<T>(patientId: string, carePlanId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(`${this.apiUrls.patientCarePlan(patientId)}/${carePlanId}/logs`, { params })
  }
}
