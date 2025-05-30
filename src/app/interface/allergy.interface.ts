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