import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '@interface/api-response.interface';
import { HttpParams } from '@angular/common/http';
import { Appointment } from '@interface/appointment.interface';
import { TeleVideoLogPayload, TelevideoStatusPayload } from '@interface/jitsi-interface';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {

    private readonly apiService = inject(ApiService);

    private readonly apiUrls = {
        appointment: 'patient-api/appointments',
        getCommonMasterData: 'master-api/master/common',
        getOrganizationLabels: 'ebplp-api/organizations/labels',
        getClinicLabels: 'ebplp-api/clinics/labels/',
        getDoctorLabels: 'ebplp-api/doctors/labels/',
        reportTemplate: 'report-template-api',
        televideo: 'patient-api/televideo',
        widget: 'patient-api/widgets',
    }


    searchAppointments<T>(params?: HttpParams): Observable<T> {
        return this.apiService.get<T>(this.apiUrls.appointment, { params });
    }

    getAppointment<T>(appointmentId: string): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.appointment}/${appointmentId}`)
    }

    createAppointment<T>(appointemnt: Appointment): Observable<T> {
        return this.apiService.post<T>(`${this.apiUrls.appointment}`, appointemnt)
    }

    updateAppointment<T>(appointmentId: string, appointment: Appointment): Observable<T> {
        return this.apiService.put<T>(`${this.apiUrls.appointment}/${appointmentId}`, appointment);
    }

    updateAppointmentStatus<T>(body: { appointmentIds: string[], status: string, reason?: string }): Observable<T> {
        return this.apiService.patch<T>(`${this.apiUrls.appointment}/status`, body)
    }

    checkAppointmentAvailability(params: HttpParams): Observable<ApiResponse<number>> {
        return this.apiService.get<ApiResponse<number>>(`${this.apiUrls.appointment}/booking-count`, { params })
    }

    getTelevideoStatusDetail<T>(params: { 'appointmentIds': string[] }): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.televideo}/status-details`, { params })
    }

    getDoctorLabels<T>(clinicId: string): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.getDoctorLabels}${clinicId}`)
    }

    resendVirtualLink<T>(appointmentId: string): Observable<T> {
        return this.apiService.post(`${this.apiUrls.appointment}/${appointmentId}/virtual-link`, {})
    }

    generateVisitReport<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.reportTemplate}/reports/visit-report/generate`, { params, responseType: 'blob'})
    }

    printPrescriptions<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.reportTemplate}/reports/prescriptions/print`, { params, responseType: 'blob' })
    }

    getJitsiTokenForDoctor<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.appointment}/jitsi-token`, { params })
    }

    updateTelevideoStatus<T>(data: TelevideoStatusPayload): Observable<T> {
        return this.apiService.put<T>(`${this.apiUrls.televideo}/patient-status`, data)
    }

    cretaeTeleVideoLogs<T>(data: TeleVideoLogPayload): Observable<T> {
        return this.apiService.post<T>(`${this.apiUrls.televideo}/log`, data)
    }

    getDoctorLabelsByPatientAppointments<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.appointment}/labels/doctors`, { params })
    }

    getClinicLabelsByPatientAppointments<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.appointment}/labels/clinics`, { params })
    }

    getAppointmentLabelsWithSignOff<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.appointment}/labels-with-signoff`, { params })
    }

    signOffOrUnlockAppointment<T>(appointmentId: string, appointment: {signOff: number, signOffReason?: string}): Observable<T> {
        return this.apiService.put<T>(`${this.apiUrls.appointment}/signoff/${appointmentId}`, appointment);
    }

    copyChart<T>(params: HttpParams): Observable<T> {
        return this.apiService.post<T>(`${this.apiUrls.appointment}/copy-chart`, params)
    }

    getAppointmentLabels<T>(params: HttpParams): Observable<T> {
        return this.apiService.get<T>(`${this.apiUrls.appointment}/labels-with-signoff/patient`, { params })
    }

    getLastAppointmentDateOfPatient<T>(params: HttpParams): Observable<T> {
      return this.apiService.get<T>(`${this.apiUrls.appointment}/last-appointment-date`, { params })
    }
}
