import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private readonly apiService = inject(ApiService);

  get endpoints(): {
    base: string;
    search: string;
    doctor: string;
    searchDoctors: string;
    searchClinics: string;
    findDoctorsByClinic: (clinicId: string) => string;
    findDoctorsBySpeciality: (specialityId: string) => string;
    getDoctorBasicDetails: (doctorId: string) => string;
    generateDoctorSlots: (doctorId: string, clinicId: string) => string;
    getDoctorSetupAndSlots: (doctorId: string, clinicId: string) => string;
    getDoctorProfile: (doctorId: string) => string;
  } {
    const base = 'ebplp-api'
    const search = `${base}/search`;
    const calenderSetup = `${base}/calendar-setup`;
    const searchDoctors = `${search}/doctors`;
    const searchClinics = `${search}/clinics`
    const doctor = `${base}/doctors`;
    return {
      base,
      search,
      doctor,
      searchDoctors,
      searchClinics,
      findDoctorsByClinic: (clinicId: string) => `${search}/clinics/${clinicId}/doctors`,
      findDoctorsBySpeciality: (specialityId: string) => `${search}/specialities/${specialityId}/doctors`,
      getDoctorBasicDetails: (doctorId: string) => `${search}/doctor/${doctorId}`,
      generateDoctorSlots: (doctorId: string, clinicId: string) => `${calenderSetup}/doctors/${doctorId}/clinics/${clinicId}/slots`,
      getDoctorSetupAndSlots: (doctorId: string, clinicId: string) => `${calenderSetup}/doctors/${doctorId}/clinics/${clinicId}`,
      getDoctorProfile: (doctorId: string) => `${doctor}/${doctorId}/profile`
    }
  }

  search<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.endpoints.search, { params });
  }
  findDoctorsByClinic<T>(clinicId: string, params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.endpoints.findDoctorsByClinic(clinicId), { params, needFullResponse: true });
  }

  findDoctorsBySpeciality<T>(specialityId: string, params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.endpoints.findDoctorsBySpeciality(specialityId), { params, needFullResponse: true });
  }

  searchDoctorsByQuery<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.endpoints.searchDoctors, { params, needFullResponse: true });
  }

  searchClinicsByQuery<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.endpoints.searchClinics, { params, needFullResponse: true });
  }

  getDoctorBasicDetails<T>(doctorId: string): Observable<T> {
    return this.apiService.get<T>(this.endpoints.getDoctorBasicDetails(doctorId));
  }

  generateDoctorSlots<T>(doctorId: string, clinicId: string,
    params: {
      appointmentId?: string;
      index: number;
      startDate: string;
      endDate: string;
    }): Observable<T> {
    return this.apiService.get<T>(`${this.endpoints.generateDoctorSlots(doctorId, clinicId)}`, { params })
  }

  getDoctorSetupAndSlots<T>(doctorId: string, clinicId: string, params: {
    appointmentId?: string;
    startDate: string;
    endDate: string;
    slotIndex: number;
  }): Observable<T> {
    return this.apiService.get<T>(`${this.endpoints.getDoctorSetupAndSlots(doctorId, clinicId)}`, { params })
  }

  getMappedDoctors<T>(): Observable<T> {
    return this.apiService.get<T>(`${this.endpoints.doctor}/mapped`);
  }

  getDoctorProfile<T>(doctorId: string): Observable<T> {
    return this.apiService.get<T>(this.endpoints.getDoctorProfile(doctorId));
  }
}
