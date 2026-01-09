import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PastHistoryInterface } from '@interface/past-history.interface';

@Injectable({
  providedIn: 'root'
})
export class PastMedicalHistoryService {

  private readonly apiUrls = {
    pastHisotry: (patientId: string) => `patient-api/patients/${patientId}/history/past`,
    master: () => 'master-api/master'
  }
  private readonly apiService = inject(ApiService);

  getMedicalConditions<T>(searchParam: string): Observable<T> {
    const params = new HttpParams().set('searchParam', searchParam);
    return this.apiService.get<T>(this.apiUrls.master() + '/medical-conditions', { params });
  }  

  addPastMedicalHistory<T>(patientId: string, formData: PastHistoryInterface): Observable<T> {
    return this.apiService.post(this.apiUrls.pastHisotry(patientId), formData);
  }

  updatePastMedicalHistory<T>(patientId: string, pastMedicalHistoryId: string, formData: PastHistoryInterface): Observable<T> {
    return this.apiService.put(`${this.apiUrls.pastHisotry(patientId)}/${pastMedicalHistoryId}`, formData);
  }

  getAllpastHistory<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.pastHisotry(patientId), { params });
  }

  getPastHistoryById<T>(patientId: string, pastMedicalHistoryId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.pastHisotry(patientId)}/${pastMedicalHistoryId}`);
  }
}
