import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {

    private apiUrls = {
        appointment: 'patient-api/appointments',
        getCommonMasterData: 'master-api/master/common',
        getOrganizationLabels: 'ebplp-api/organizations/labels',
        getClinicLabels: 'ebplp-api/clinics/labels/',
        getDoctorLabels: 'ebplp-api/doctors/labels/',
    }

    constructor(private apiService: ApiService) { }

    getOrganizationLabels<T>(): Observable<T> {
        return this.apiService.get(this.apiUrls.getOrganizationLabels)
    }

    getClinicLabels<T>(organizationId): Observable<T> {
        return this.apiService.get(`${this.apiUrls.getClinicLabels}${organizationId}`)
    }

    getDoctorLabels<T>(clinicId): Observable<T> {
        return this.apiService.get(`${this.apiUrls.getDoctorLabels}${clinicId}`)
    }

    getCommonMasterData<T>(names: string[]): Observable<T> {
        let params = new HttpParams();
        names.forEach((name) => {
            params = params.append('name', name);
        })
        return this.apiService.get(this.apiUrls.getCommonMasterData, { params });
    }

    searchAppointments<T>(params?): Observable<T> {
        return this.apiService.get(this.apiUrls.appointment, { params });
    }

    getAppointment<T>(appointmentId): Observable<T> {
        return this.apiService.get(`${this.apiUrls.appointment}/${appointmentId}`)
    }

    createAppointment<T>(appointemnt): Observable<T> {
        return this.apiService.post(`${this.apiUrls.appointment}`, appointemnt)
    }

    updateAppointment<T>(appointmentId, appointment): Observable<T> {
        return this.apiService.put(`${this.apiUrls.appointment}/${appointmentId}`, appointment);
    }

    updateAppointmentStatus<T>(body): Observable<T> {
        return this.apiService.patch(`${this.apiUrls.appointment}/status`, body)
    }

    getAppointmentLabels<T>(params): Observable<T> {
        return this.apiService.get(`${this.apiUrls.appointment}/labels`, { params })
    }

    getAppointments<T>(params?: { start?: string, end?: string }): Observable<T> {
        let httpParams = new HttpParams();

        if (params?.start) {
            httpParams = httpParams.set('start', params.start);
        }

        if (params?.end) {
            httpParams = httpParams.set('end', params.end);
        }

        return this.apiService.get(`${this.apiUrls.appointment}/events`, { params: httpParams });
    }

    resizeAppointment<T>(appointmentId, appointment): Observable<T> {
        return this.apiService.put(`${this.apiUrls.appointment}/resize/${appointmentId}`, appointment);
    }

}