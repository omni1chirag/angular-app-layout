import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Medication } from '@interface/medication.interface';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  private readonly apiUrls = {
    medication: (patientId: string) => `patient-api/patients/${patientId}/medications`,
    master: () => 'master-api/master',
    allMedications: () => 'patient-api/medications',
    reportTemplate: 'report-template-api'
  }
  private readonly apiService = inject(ApiService);

  saveMedication<T>(patientId: string, medication: Medication): Observable<T> {
    return this.apiService.post(this.apiUrls.medication(patientId), medication);
  }

  updateMedication<T>(patientId: string, medicationId: string, medication: Medication): Observable<T> {
    return this.apiService.put(`${this.apiUrls.medication(patientId)}/${medicationId}`, medication);
  }

  getMedication<T>(patientId: string, medicationId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.medication(patientId)}/${medicationId}`);
  }

  getMedications<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.medication(patientId), { params });
  }

  deleteMedication<T>(patientId: string, medicationId: string): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.medication(patientId)}/${medicationId}`);
  }

  getAllFrequentlyUsedMedicines<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/medicines/frequentlyused');
  }

  getMedicationById<T>(patientId: string, medicationId: string): Observable<T> {
    return this.apiService.get(`${this.apiUrls.medication(patientId)}/${medicationId}`);
  }

  getAllMedications<T>(params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.allMedications(), { params });
  }

  getRouteOfAdministratorList<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.master() + '/drugs/routesOfAdministrator');
  }

  checkSubstanceIsPresentInPatientAllergies<T>(patientId: string, substanceIdentifiers: string[]): Observable<T> {
    const params = new HttpParams().set('substanceIdentifiers', substanceIdentifiers.join(','));
    return this.apiService.get(`${this.apiUrls.medication(patientId)}/check/warning`, { params, needFullResponse: true });
  }

  getAllPatientMedications<T>(patientId: string, params: HttpParams): Observable<T> {
    return this.apiService.get(this.apiUrls.medication(patientId), { params });
  }

  printPrescriptions<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.reportTemplate}/reports/prescriptions/print`, { params, responseType: 'blob' })
  }

}
