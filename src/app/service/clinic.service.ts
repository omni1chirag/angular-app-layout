import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private readonly apiService = inject(ApiService);

  get endpoints(): {
    base: string;
    clinic: string;
  } {
    const base = 'ebplp-api'
    const clinic = `${base}/clinics`;
    return {
      base,
      clinic
    }
  }

  getClinicProfile<T>(clinicId: string): Observable<T> {
    return this.apiService.get<T>(`${this.endpoints.clinic}/${clinicId}/profile`);
  }

}
