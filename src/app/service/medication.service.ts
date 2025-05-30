import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  private apiUrls = {
    medication: (patientId: string) => `patient-api/patients/${patientId}/medications`,
    master: () => 'master-api/master',
  }
  private apiService = inject(ApiService);

  constructor() { }

  saveMedication<T>(patientId, medication): Observable<T> {
    return this.apiService.post(this.apiUrls.medication(patientId), medication);
  }

  updateMedication<T>(patientId, medicationId, medication): Observable<T> {
    return this.apiService.put(`${this.apiUrls.medication(patientId)}/${medicationId}`, medication);
  }

  getMedication<T>(patientId, medicationId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.medication(patientId)}/${medicationId}`);
  }

  getMedications<T>(patientId: string, appointmentId?: string): Observable<T> {
    const params = appointmentId ? { appointmentId } : {}
    return this.apiService.get(this.apiUrls.medication(patientId), { params });
  }

  deleteMedication<T>(patientId, medicationId): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.medication(patientId)}/${medicationId}`);
  }

  getAllFrequentlyUsedMedicines<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.master()+'/medicines/frequentlyused');
  }

  searchMedicines<T>(searchParam: string): Observable<T> {
    return this.apiService.get(this.apiUrls.master()+'/medicines/search', { params: { searchParam } });
  }

}
