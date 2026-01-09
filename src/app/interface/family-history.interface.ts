export interface FamilyHistoryInterface {
    familyHistoryId: string;
    relation: string;
    healthCondition: string;
    age?: number;
    isDeceased: boolean;
    causeOfDeath?: string;
    notes?: string;
    patientId: string;
    appointmentId?: string;
}
