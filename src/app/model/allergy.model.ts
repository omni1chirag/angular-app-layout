export class Allergy {
    allergyId: string;
    allergenName: string;
    allergenType: string;
    allergyStatus: string;
    severity: string;
    reactionStatus: string;
    reactionSymptoms: string[];
    onsetDate: Date;
    recordedDate: Date;
    reports: any;
    notes: string;
    appointmentId: string;
}