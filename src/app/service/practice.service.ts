import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PracticeService {
 
  private apiUrls = {
    practice: 'ebplp-api/practices',
    getOrganizationLabels: 'ebplp-api/organizations/labels',
    getPracticeLabels: 'ebplp-api/practices/labels/',
  }
  constructor(private http: HttpClient,
      private apiService: ApiService) {}

  getOrganizationLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getOrganizationLabels)
  }

  createPractice<T>(practice): Observable<T> {
    return this.apiService.post(this.apiUrls.practice, practice);
  }

  updatePractice<T>(practiceId, practice): Observable<T> {  
    return this.apiService.put(`${this.apiUrls.practice}/${practiceId}`, practice);
  }

  getPracticeById<T>(practiceId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.practice}/${practiceId}`);
  }

  getAllPractices<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.practice,{params});
  }

  updatePracticeStatus(practiceId, data): Observable<any> {
    return this.apiService.patch(`${this.apiUrls.practice}/${practiceId}/status`, data);
  }

  getPracticeLabels<T>(organizationId): Observable<T> {
    return this.apiService.get( `${this.apiUrls.getPracticeLabels}${organizationId}`)
  }

  searchPractices<T>(query: any): Observable<T> {
    let params = new HttpParams().append('practiceName', query);
    return this.apiService.get(`${this.apiUrls.practice}/search`, {params});
  }

}
