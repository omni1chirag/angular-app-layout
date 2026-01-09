export interface Medication {
    medicationId: string | null;
    patientId: string;
    medicationName: string;
    appointmentId: string | null;
    routeName: string;
    morningFrequency: number | null;
    afternoonFrequency: number | null;
    eveningFrequency: number | null;
    nightFrequency: number | null;
    customFrequency: number;
    otherFrequency: string | null;
    timing: string;
    duration: string | null;
    durationUnit: string | null;
    quantity: string | null;
    totalQuantity: string;
    quantityUnit: string;
    startDate: Date;
    instructions: string | null;
    status: number;
    prescribedBy: string;
    reason: string | null;
}

export interface MedicationList extends Medication {
    isEditable?: boolean;
    appointmentSignOff?: number | null;
}

export interface LabelValueSubstance<T> {
    label: string;
    value: T;
    substanceIdentifier?: string | null;
}
