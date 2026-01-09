import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FamilyHistoryInterface } from '@interface/family-history.interface';

@Injectable({
  providedIn: 'root'
})
export class FamilyHistoryService {

  private readonly apiUrls = {
    familyHistory: (patientId: string) => `patient-api/patients/${patientId}/history/family`,
    master: () => 'master-api/master'
  }

  private readonly apiService = inject(ApiService);

  getHealthConditions<T>(searchParam: string): Observable<T> {
    const params = new HttpParams().set('searchParam', searchParam)
    return this.apiService.get(`${this.apiUrls.master()}/health-condition`, { params });
  }

  addFamilyHistory<T>(patientId: string, formData: FamilyHistoryInterface): Observable<T> {
    return this.apiService.post(this.apiUrls.familyHistory(patientId), formData);
  }

  updateFamilylHistory<T>(patientId: string, familyHistoryId: string, formData: FamilyHistoryInterface): Observable<T> {
    return this.apiService.put(`${this.apiUrls.familyHistory(patientId)}/${familyHistoryId}`, formData);
  }

  getAllFamilyHistory<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.familyHistory(patientId), { params });
  }

  getFamilyHistoryById<T>(patientId: string, familyHistoryId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.familyHistory(patientId)}/${familyHistoryId}`);
  }
}
