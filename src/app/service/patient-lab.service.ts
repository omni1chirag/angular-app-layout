import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PatientLabService {

  private readonly apiUrls = {
    labOrder: (patientId?: string) => `patient-api/patients/${patientId}/patient-lab-order`,
    labOrderList: `patient-api/lab-order`,
    labOrderById: (patientId: string, selectedLabId: string) =>
      `patient-api/patients/${patientId}/patient-lab-order/${selectedLabId}`,
    master: () => 'master-api/master',
  }
  private readonly apiService = inject(ApiService);

  getAllLabs<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.labOrder(patientId), { params });
  }

  getLabTestNames<T>(searchParam: string, labType: string): Observable<T> {
    const params = new HttpParams()
      .set('searchParam', searchParam)
      .set('labType', labType)
      .set('page', 0)
      .set('size', 50);

    return this.apiService.get(`${this.apiUrls.master()}/lab-test-name`, { params });
  }
  
  getAllLabsList<T>(params?: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.labOrderList, { params });
  }    

}
