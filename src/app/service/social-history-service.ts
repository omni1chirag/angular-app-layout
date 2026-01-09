import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SocialHistoryInterface } from '@interface/social-history.interface';

@Injectable({
  providedIn: 'root'
})
export class SocialHistoryService {

  private readonly apiUrls = {
    socialHistory: (patientId: string) => `patient-api/patients/${patientId}/history/social`,
    master: () => 'master-api/master'
  }
  private readonly apiService = inject(ApiService);

  getDrugUseTypes<T>(searchParam: string): Observable<T> {
    const params = new HttpParams().set('searchParam', searchParam)
    return this.apiService.get(`${this.apiUrls.master()}/drug-type`, { params });
  }

  addSocialHistory<T>(patientId: string, formData: SocialHistoryInterface): Observable<T> {
    return this.apiService.post(this.apiUrls.socialHistory(patientId), formData);
  }

  updateSocialHistory<T>(patientId: string, socialHistoryId: string, formData: SocialHistoryInterface): Observable<T> {
    return this.apiService.put(`${this.apiUrls.socialHistory(patientId)}/${socialHistoryId}`, formData);
  }

  getAllSocialHistory<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.socialHistory(patientId), { params });
  }

  getSocialHistoryById<T>(patientId: string, socialHistoryId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.socialHistory(patientId)}/${socialHistoryId}`);
  }
}
