export interface Allergen {
  allergenId: number;
  allergenName: string;
  allergenType: string;
}

export interface AllergicReaction {
  allergicReactionId: number;
  name: string;
}

export interface AllergyData {
  allergens: Allergen[];
  allergicReactions: AllergicReaction[];
}

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
    reports: string;
    notes: string;
    appointmentId: string;
}