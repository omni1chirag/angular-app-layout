import { MenuItem } from "primeng/api";

export type AppointmentType = 'IN_PERSON' | 'VIDEO_CALL' | null;

export const AppointmentTypeMeta: Record<Exclude<AppointmentType, null>, { label: string; icon: string }> = {
    IN_PERSON: { label: 'In-Person', icon: 'pi pi-user' },
    VIDEO_CALL: { label: 'Video Call', icon: 'pi pi-video' },
};

export type AppointmentStatus =
    | 'BOOKED'
    | 'CONFIRMED'
    | 'RESCHEDULED'
    | 'ONGOING'
    | 'COMPLETED_WITH_PRESCRIPTION'
    | 'COMPLETED_WITHOUT_PRESCRIPTION'
    | 'CANCELLED_BY_PATIENT'
    | 'CANCELLED_BY_DOCTOR'
    | 'CANCELLED_BY_STAFF'
    | 'NO_SHOW';

export const AppointmentStatusMeta: Record<AppointmentStatus, { label: string; bgColor: string; textColor: string }> = {
    BOOKED: { label: 'Booked', bgColor: '#0ea5e9', textColor: '#ffffff' },
    CONFIRMED: { label: 'Confirmed', bgColor: '#14b8a6', textColor: '#ffffff' },
    RESCHEDULED: { label: 'Rescheduled', bgColor: '#ec4899', textColor: '#ffffff' },
    ONGOING: { label: 'Ongoing', bgColor: '#8b5cf6', textColor: '#ffffff' },
    COMPLETED_WITH_PRESCRIPTION: { label: 'Completed with Prescription', bgColor: '#10b981', textColor: '#ffffff' },
    COMPLETED_WITHOUT_PRESCRIPTION: { label: 'Completed without Prescription', bgColor: '#22c55e', textColor: '#ffffff' },
    CANCELLED_BY_PATIENT: { label: 'Cancelled by Patient', bgColor: '#f97316', textColor: '#ffffff' },
    CANCELLED_BY_DOCTOR: { label: 'Cancelled by Doctor', bgColor: '#ef4444', textColor: '#ffffff' },
    CANCELLED_BY_STAFF: { label: 'Cancelled by Staff', bgColor: '#f43f5e', textColor: '#ffffff' },
    NO_SHOW: { label: 'No Show / Missed', bgColor: '#64748b', textColor: '#ffffff' },
};

export function getAppointmentTypeLabel(type: AppointmentType): string {
    return type ? AppointmentTypeMeta[type].label : 'Unknown';
}

export function getAppointmentTypeIcon(type: AppointmentType): string {
    return type ? AppointmentTypeMeta[type].icon : '';
}

export function getAppointmentStatusMeta(status: AppointmentStatus): { label: string; bgColor: string; textColor: string } {
    return status ? AppointmentStatusMeta[status] : { label: 'Unknown', bgColor: '#ccc', textColor: '#000' };
}

export interface VisitMaster {
    visitMasterId: number;
    value: string;
    label: string;
}

export interface AppointmentList {
    appointmentId: string;
    patient: PatientFullName;
    clinic: Clinic;
    doctor: Doctor;
    appointmentType: 'In-Person' | 'Video Call';
    appointmentDateTime: Date;
    rfv: string;
    appointmentStatus: string;
    callStatus: string,
    badgeColor: string
    roomName: string | null;
    signOff: number;
    chartingStatus: string;
    menuItems: MenuItem[]
}

export interface PatientFullName {
    patientId: string;
    fullName: string;
}

export interface Clinic {
    clinicId: string;
    clinicName: string;
}

export interface Doctor {
    doctorId: string;
    fullName: string;
    title?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
}

export interface TelevideoStatusDetail {
    badgeColor: string;
    duration: number | null;
    callStatus: string;
    appointmentId: string;
}

export interface Appointment {
    appointmentId?: string;
    clinicId?: string;
    patient?: { patientId: string };
    doctorId?: string;
    appointmentType?: AppointmentType;
    appointmentStartDateTime?: string;
    appointmentEndDateTime?: string;
    reasonForVisit?: string[];
    notes?: string;
    appointmentStatus?: string;
}

export interface LabelValueAndSignOff {
    label: string;
    value: string;
    signOff: number;
    appointmentStatus: string;
}

export interface AppointmentOption {
    doctorId: string;
    clinicId: string;
    appointmentId: string;
    appointmentType: AppointmentType;
    appointmentStatus: AppointmentStatus;
    appointmentDateTime: string;
    signOff: number;
}

