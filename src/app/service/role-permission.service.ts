import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  private apiUrls = {
    getRoleLabels: 'ebplp-api/roles/labels',
    role: 'ebplp-api/roles',
    permissions: 'ebplp-api/menu/permissions',
  }

  private apiService = inject(ApiService);

  getRoleLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getRoleLabels)
  }

  getRoles<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.role)
  }

  getPermissions<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.permissions)
  }

  createRole<T>(role): Observable<T> {
    return this.apiService.post(this.apiUrls.role, role);
  }

  updateRoleStatus(roleId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.role}/${roleId}/status`, data);
  }

  updateRolePermission(roleId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.role}/${roleId}/permissions`, data);
  }

  getRolePermission<T>(roleId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.role}/permissions/${roleId}`)
  }

}
