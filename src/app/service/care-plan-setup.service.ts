import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CarePlanAssignRequest, CreateCarePlanSetup } from '@interface/careplan.interface';

@Injectable({
  providedIn: 'root'
})
export class CarePlanSetupService {

  private readonly apiUrls = {
    carePlanSetup: 'ebplp-api/care-plan-setups',
  }

  private readonly apiService = inject(ApiService);

  getCarePlanSetup<T>(carePlanSetupId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.carePlanSetup}/${carePlanSetupId}`)
  }

  saveCarePlanSetup<T>(carePlanSetup: CreateCarePlanSetup): Observable<T> {
    return this.apiService.post(this.apiUrls.carePlanSetup, carePlanSetup);
  }

  updateCarePlanSetup<T>(carePlanSetupId: string, carePlanSetup: CreateCarePlanSetup): Observable<T> {

    return this.apiService.put(`${this.apiUrls.carePlanSetup}/${carePlanSetupId}`, carePlanSetup);
  }

  getAllCarePlanSetup<T>(params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.carePlanSetup, { params });
  }

  assignCarePlanSetup<T>(carePlanSetupId: string, data: CarePlanAssignRequest): Observable<T> {
    return this.apiService.post(`${this.apiUrls.carePlanSetup}/${carePlanSetupId}/assign`, data);
  }

  searchCarePlanSetups<T>(searchParams: string): Observable<T> {
    const params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.carePlanSetup}/search`, { params });
  }

  softSearchCarePlanSetups<T>(searchParams: string): Observable<T> {
    const params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.carePlanSetup}/soft-search`, { params });
  }

  updateCarePlanSetupStatus<T>(carePlanSetupId: string, status: number): Observable<T> {
    return this.apiService.patch(`${this.apiUrls.carePlanSetup}/${carePlanSetupId}/status`, { status });
  }
}
