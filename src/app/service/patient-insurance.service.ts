import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PatientInsuranceService {

  private apiService = inject(ApiService);

  savePatientInsurance<T>(patientId, insurance): Observable<T> {
    return this.apiService.post(`patient-api/patients/${patientId}/insurances`, insurance);
  }

  updatePatientInsurance<T>(patientId, patientInsuranceId, insurance): Observable<T> {
    return this.apiService.put(`patient-api/patients/${patientId}/insurances/${patientInsuranceId}`, insurance);
  }

  getAllPatientInsurance<T>(patientId): Observable<T> {
    return this.apiService.get(`patient-api/patients/${patientId}/insurances`);
  }

  getPatientInsurance<T>(patientId, patientInsuranceId): Observable<T> {
    return this.apiService.get(`patient-api/patients/${patientId}/insurances/${patientInsuranceId}`);
  }

  updatePatientInsuranceStatus(patientId, patientInsuranceId, data): Observable<any> {
    return this.apiService.patch(`patient-api/patients/${patientId}/insurances/${patientInsuranceId}/status`, data);
  }

}
