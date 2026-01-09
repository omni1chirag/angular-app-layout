import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { AcceptTermsRequestDTO } from '../terms-and-condition.interface';

@Injectable({
  providedIn: 'root'
})
export class TermsAndConditionService {

  private readonly apiUrls = {
    terms: 'master-api/terms',
  }

  private readonly apiService = inject(ApiService);

  getLatestTerms<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.terms}`, { params });
  }

  acceptTerms<T>(dto: AcceptTermsRequestDTO): Observable<T> {
    return this.apiService.post<T>(`${this.apiUrls.terms}/accept`, dto);
  }

  checkTermsStatus<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.terms}/status`, { params });
  }


}
