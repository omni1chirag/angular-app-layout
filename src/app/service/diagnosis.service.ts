import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { CreateDiagnosis } from '@interface/diagnosis.interface';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {

  private readonly apiUrls = {
    diagnosis: (patientId: string) => `patient-api/patients/${patientId}/diagnosis`,
    master: () => 'master-api/master',
  }
  private readonly apiService = inject(ApiService);

  getAllDiagnosis<T>(patientId: string, params?: HttpParams): Observable<T> {
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

  saveDiagnosis<T>(patientId: string, Diagnosis: CreateDiagnosis): Observable<T> {
    return this.apiService.post(this.apiUrls.diagnosis(patientId), Diagnosis);
  }

  updateDiagnosis<T>(patientId: string, DiagnosisId: string, Diagnosis: CreateDiagnosis): Observable<T> {
    return this.apiService.put(`${this.apiUrls.diagnosis(patientId)}/${DiagnosisId}`, Diagnosis);
  }

  getDiagnosisById<T>(patientId: string, diagnosisId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.diagnosis(patientId)}/${diagnosisId}`);
  }

}
