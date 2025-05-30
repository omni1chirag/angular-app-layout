import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrls = {
    user: 'ebplp-api/users',
    getOrganizationLabels: 'ebplp-api/organizations/labels',
    getClinicLabels: 'ebplp-api/clinics/labels/',
    getRoleLabels: 'ebplp-api/roles/labels',


  }

  private apiService = inject(ApiService);

  getRoleLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getRoleLabels)
  }

  getOrganizationLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getOrganizationLabels)
  }

  getClinicLabels<T>(organizationId): Observable<T> {
    return this.apiService.get( `${this.apiUrls.getClinicLabels}${organizationId}`)
  }

  getUser<T>(userId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.user}/${userId}`)
  }

  
  getUsers<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.user,{params});
  }

  saveUser<T>(user): Observable<T> {
    return this.apiService.post(this.apiUrls.user, user);
  }

  updateUser<T>(userId,user): Observable<T> {
    return this.apiService.put(`${this.apiUrls.user}/${userId}`, user);
  }
  
  updateUserStatus(userId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.user}/${userId}/status`, data);
  }

  searchUsers<T>(searchParams: any): Observable<T> {
    let params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.user}/search`, {params});
  }

  verifyMapping(data): Observable<any> {
    return this.apiService.post(`${this.apiUrls.user}/verify-mapping`, data, {withCredentials : false});
  }

  updatePreferredClinic(userId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.user}/${userId}/preferred-clinic`, data);
  }
}
