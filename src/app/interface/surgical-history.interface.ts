export interface SurgicalHistoryInterface {
    surgicalHistoryId: string;
    surgeryName: string;
    surgeryType: string;
    surgeryDate: Date;
    hospitalName?: string;
    doctorName?: string;
    status: string;
    notes?: string;
    patientId: string;
    appointmentId?: string;
}
