import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {

  private apiUrls = {
    diagnosis: (patientId: string) => `patient-api/patients/${patientId}/diagnosis`,
    master: () => 'master-api/master',
  }
  private apiService = inject(ApiService);

  constructor() { }

  getAllDiagnosis<T>(patientId: string, appointmentId?: string): Observable<T> {
    const params = appointmentId ? { appointmentId } : {};
    return this.apiService.get(this.apiUrls.diagnosis(patientId), { params });
  }

  searchDiagnosis<T>(searchParam: string): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/diagnosis/search', { params: { searchParam } });
  }

  getAllFrequentlyUsedDiagnosis<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/diagnosis/frequentlyused');
  }

  deleteDiagnosis<T>(patientId: string, diagnosisId: string): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.diagnosis(patientId)}/${diagnosisId}`);
  }

  saveDiagnosis<T>(patientId: string, Diagnosis): Observable<T> {
    return this.apiService.post(this.apiUrls.diagnosis(patientId), Diagnosis);
  }

  updateDiagnosis<T>(patientId: string, DiagnosisId, Diagnosis): Observable<T> {
    return this.apiService.put(`${this.apiUrls.diagnosis(patientId)}/${DiagnosisId}`, Diagnosis);
  }
  
}
