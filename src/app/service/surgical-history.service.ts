import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SurgicalHistoryInterface } from '@interface/surgical-history.interface';

@Injectable({
  providedIn: 'root'
})
export class SurgicalHistoryService {

  private readonly apiUrls = {
    surgicalHistory: (patientId: string) => `patient-api/patients/${patientId}/history/surgical`,
    master: () => 'master-api/master'
  };

  private readonly apiService = inject(ApiService);

  getMedicalConditions<T>(searchParam: string): Observable<T> {
    const params = new HttpParams().set('searchParam', searchParam)
    return this.apiService.get(`${this.apiUrls.master()}/surgery-names`, { params });
  }

  addSurgicalMedicalHistory<T>(patientId: string, formData: SurgicalHistoryInterface): Observable<T> {
    return this.apiService.post(this.apiUrls.surgicalHistory(patientId), formData);
  }

  updateSurgicalMedicalHistory<T>(patientId: string, pastMedicalHistoryId: string, formData: SurgicalHistoryInterface): Observable<T> {
    return this.apiService.put(`${this.apiUrls.surgicalHistory(patientId)}/${pastMedicalHistoryId}`, formData);
  }

  getAllSurgicalHistory<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.surgicalHistory(patientId), { params });
  }

  getSurgicalHistoryById<T>(patientId: string, surgicalHistoryId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.surgicalHistory(patientId)}/${surgicalHistoryId}`);
  }

}
