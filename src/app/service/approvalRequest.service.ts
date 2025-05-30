import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root',
})
export class ApprovalRequestService {
  private apiUrls = {
    doctors: 'ebplp-api/doctors/approval-requests',
    approvalRequest: 'ebplp-api/doctors'
  };

  constructor(private http: HttpClient,
    private apiService: ApiService) {}

  getDoctors<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.doctors, { params });
  }

  searchDoctors<T>(query: any): Observable<T> {
    let params = new HttpParams().append('doctorName', query);
    return this.apiService.get(`${this.apiUrls.approvalRequest}/search`, {params});
  }

  updateDoctorStatus(doctorId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.approvalRequest}/${doctorId}/status`, data);
  }

  updateAllDoctorStatus(doctorIds, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.approvalRequest}/status`, data, { params: { doctorIds } });
  }
}
