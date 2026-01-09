export interface Diagnosis {
    diagnosisId: string;
    diagnosisName: string;
    appointmentId: string;
    onsetDate?: string | null;
    reportedDate?: string | null;
    endDate?: string | null;
    status: number;
    notes?: string | null;
    appointmentSignOff?: number | null;
    isEditable?: boolean;
}


export interface CreateDiagnosis {
    diagnosisName: string;
    appointmentId?: string;
    onsetDate: string;
    reportedDate: string;
    endDate?: string;
    status: number;
    notes?: string;
}