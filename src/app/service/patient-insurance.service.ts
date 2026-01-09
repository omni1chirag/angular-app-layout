import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { InsuranceModel } from '@model/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class PatientInsuranceService {

  private readonly apiService = inject(ApiService);

  savePatientInsurance<T>(patientId: string, insurance: InsuranceModel): Observable<T> {
    return this.apiService.post(`patient-api/patients/${patientId}/insurances`, insurance);
  }

  updatePatientInsurance<T>(patientId: string, patientInsuranceId: string, insurance: InsuranceModel): Observable<T> {
    return this.apiService.put(`patient-api/patients/${patientId}/insurances/${patientInsuranceId}`, insurance);
  }

  getAllPatientInsurance<T>(patientId: string): Observable<T> {
    return this.apiService.get(`patient-api/patients/${patientId}/insurances`);
  }

  getPatientInsurance<T>(patientId: string, patientInsuranceId: string): Observable<T> {
    return this.apiService.get(`patient-api/patients/${patientId}/insurances/${patientInsuranceId}`);
  }

  updatePatientInsuranceStatus<T>(patientId: string, patientInsuranceId: string, status: number): Observable<T> {
    return this.apiService.patch(`patient-api/patients/${patientId}/insurances/${patientInsuranceId}/status`, { status });
  }

}
