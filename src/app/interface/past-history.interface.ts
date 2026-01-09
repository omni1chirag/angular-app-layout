export interface PastHistoryInterface {
    pastMedicalHistoryId: string;
    medicalCondition: string;
    diagnosisDate: Date;
    status: string;
    notes?: string;
    patientId: string;
    appointmentId?: string;
}
