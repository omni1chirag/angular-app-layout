import { ValidatorFn } from "@angular/forms";
import { LabelValue } from "./common.interface";

export interface VitalConfig {
    label: string;
    placeHolder: string;
    isBloodPressure?: boolean;
    defaultUnit: string;
    validators: ValidatorFn[];
    pattern?: RegExp;
    checkFnKey: 'checkHeartRate' | 'checkSpo2' | 'checkBodyTemperature' | 'checkBloodPressure' | 'calculateBMI' | 'checkBmi' | 'checkBloodGlucose' | 'checkRespiratoryRate';
    isDisabled?: boolean;
    unit: LabelValue<string>[]
}

export interface VitalField {
    value: number,
    unit: string,
    status: string
};

export interface VitalFieldWildCard<T> {
    value: T,
    unit: string,
    status: string
};

export interface PatientVitalResponse {
    vitalsId: string | null;
    recordedDate: string | null;
    patientId: string | null;
    appointmentId: string | null;
    carePlanId: string | null;
    notes: string | null;
    bodyTemperature: VitalFieldWildCard<number> | null;
    weight: VitalFieldWildCard<number> | null;
    height: VitalFieldWildCard<number> | null;
    heartRate: VitalFieldWildCard<number> | null;
    spo2: VitalFieldWildCard<number> | null;
    respiratoryRate: VitalFieldWildCard<number> | null;
    bloodPressure: VitalFieldWildCard<string> | null;
    bmi: VitalFieldWildCard<number> | null;
    bloodGlucose: VitalFieldWildCard<number> | null;
}


export interface PatientVitalList {
    vitalsId: string | null;
    recordedDate: string | null;
    recordedDateStr: string | null;
    recordedDateTime: Date | null;
    notes: string | null;
    bodyTemperature: VitalFieldWildCard<number> | null;
    weight: VitalFieldWildCard<number> | null;
    height: VitalFieldWildCard<number> | null;
    heartRate: VitalFieldWildCard<number> | null;
    spo2: VitalFieldWildCard<number> | null;
    respiratoryRate: VitalFieldWildCard<number> | null;
    bloodPressure: VitalFieldWildCard<string> | null;
    bmi: VitalFieldWildCard<number> | null;
    bloodGlucose: VitalFieldWildCard<number> | null;
}

export interface PatientVitalRequest {
    recordedDate: Date | null;
    appointmentId: string | null;
    carePlanId: string | null;
    notes: string | null;
    bodyTemperature: VitalFieldWildCard<number> | null;
    weight: VitalFieldWildCard<number> | null;
    height: VitalFieldWildCard<number> | null;
    heartRate: VitalFieldWildCard<number> | null;
    spo2: VitalFieldWildCard<number> | null;
    respiratoryRate: VitalFieldWildCard<number> | null;
    bloodPressure: VitalFieldWildCard<string> | null;
    bmi: VitalFieldWildCard<number> | null;
    bloodGlucose: VitalFieldWildCard<number> | null;
}


export interface TodaysReadingList {
    recordedDate?: string | null;
    bodyTemperature?: number | null;
    bodyTemperatureUnit?: string | null;

    weight?: number | null;
    weightUnit?: string | null;

    height?: number | null;
    heightUnit?: string | null;

    heartRate?: number | null;
    heartRateUnit?: string | null;

    spo2?: number | null;
    spo2Unit?: string | null;

    respiratoryRate?: number | null;
    respiratoryRateUnit?: string | null;

    bloodPressure?: string | null;
    bloodPressureUnit?: string | null;

    bmi?: number | null;
    bmiUnit?: string | null;

    bloodGlucose?: number | null;
    bloodGlucoseUnit?: string | null;

    patientId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export interface LabelValueAndSignOff {
    label: string;
    value: string;
    signOff: number;
    appointmentStatus: string;
}

