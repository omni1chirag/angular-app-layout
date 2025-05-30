import { inject, Injectable } from '@angular/core';
import { ApiService } from '../service/api.service';
import { Organization } from '@model/organization.model';
import { Observable, tap } from 'rxjs';
import { NotificationService } from '../service/notification.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
  
})
export class OrganizationService {
  private notificationService = inject(NotificationService);
  private apiService = inject (ApiService)

  get endpoints() {
    const base = 'ebplp-api/organizations';
    return {
      base,
      byId: (id: string) => `${base}/${id}`,
      list: `${base}/list`,
      search: `${base}/search`,
      status: `${base}/status`,
    };
  }

  constructor() {
  }

  createOrganization(org: Omit<Organization, 'id'>): Observable<Organization> {
    return this.apiService.post<Organization>(this.endpoints.base, org).pipe(
      tap(() => this.notificationService.showSuccess('Organization created successfully'))
    );
  }

  getOrganizations<T>(params?): Observable<any> {
    return this.apiService.get<any[]>(this.endpoints.base, {params});
  }

  getOrganizationById(id: string): Observable<any> {
    return this.apiService.get<any>(this.endpoints.byId(id));
  }

  updateOrganization(id: string, org: Partial<Organization>): Observable<Organization> {
    return this.apiService.put<Organization>(this.endpoints.byId(id), org);
  }

  deleteOrganization(id: string): Observable<void> {
    return this.apiService.delete<void>(this.endpoints.byId(id));
  }

  searchOrganizations<T>(query: any):  Observable<T> {
    let params = new HttpParams().append('organizationName', query);
    return this.apiService.get(this.endpoints.search, { params });
  }

  updateOrganizationStatus(id:string, status:string): Observable<any> {
    let data = {organizationId: id, organizationStatus: status}
    return this.apiService.patch(this.endpoints.status,data);
  }
  
}
