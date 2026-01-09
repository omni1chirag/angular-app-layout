import { Patient } from "@interface/patient-profile.interface";

export class InsuranceModel {
    patientInsuranceId: string | null;
    insuranceId: number | null;
    insuranceFreeText: string | null;
    policyNumber: string | null;
    policyStartDate: Date | null;
    policyExpiryDate: Date | null;
    status: number | null;
}

export interface PatientInsurance {
    patientInsuranceId: string | null;
    insuranceId: number | null;
    insuranceFreeText: string | null;
    policyNumber: string | null;
    policyStartDate: Date | null;
    policyExpiryDate: Date | null;
    status: number | null;

    patient: Patient | null;
}