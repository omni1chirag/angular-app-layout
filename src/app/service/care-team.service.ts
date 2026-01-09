import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { CreateCareTeam } from "@interface/care-team.interface";

@Injectable({
  providedIn: 'root'
})
export class CareTeamService {
  private readonly apiUrls = {
    getRoleLabels: 'ebplp-api/roles/care-team/labels',
    getAgencyLabels: 'ebplp-api/care-agency/labels',
    careTeam: 'ebplp-api/care-team'
  }

  private readonly apiService = inject(ApiService);

  getRoleLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getRoleLabels);
  }

  getAgencyLabels<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getAgencyLabels);
  }

  getCareTeam<T>(careTeamId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.careTeam}/${careTeamId}`)
  }

  saveCareTeam<T>(careTeam: CreateCareTeam): Observable<T> {
    return this.apiService.post(this.apiUrls.careTeam, careTeam, { needFullResponse: true });
  }

  updateCareTeam<T>(careTeamId: string, careTeam: CreateCareTeam): Observable<T> {
    return this.apiService.put(`${this.apiUrls.careTeam}/${careTeamId}`, careTeam, { needFullResponse: true });
  }

  searchCareTeam<T>(searchParams: string): Observable<T> {
    const params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.careTeam}/search`, { params });
  }


  searchMembers<T>(searchParams: string): Observable<T> {
    const params = new HttpParams().append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.careTeam}/search`, { params });
  }

  getCareTeamMemberList<T>(params?: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.careTeam, { params });
  }

  updateCareTeamStatus<T>(careTeamId: string, status: number): Observable<T> {
    return this.apiService.patch(`${this.apiUrls.careTeam}/${careTeamId}/status`, { status }, { needFullResponse: true });
  }

}