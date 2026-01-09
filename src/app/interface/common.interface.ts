import { KeycloakProfile } from "keycloak-js";
import { PatientMapping } from "./patient-profile.interface";

export interface AppUserProfile extends KeycloakProfile {
    dashboardRoute?: string;
}

export interface AuthUserResponse {
    menuItems: MenuItem[]; // Replace 'any' with proper type if available
    user: unknown;        // Replace with actual user type
    dashboardRoute: string;
    userClinics: LabelValue<string>[];
    preferredClinicId: string;
    doctorId: string;
    patientProfiles: PatientMapping[];
    activePatientProfile: string;
}
export interface MenuItem {
    separator?: boolean;
    label?: string;
    tooltip?: string;
    icon?: string;
    svgIcon?: string;
    routerLink?: string[];
    singleItem?: MenuItem;
    items?: MenuItem[];
}
export interface LabelValue<T, J = undefined> {
    label: string;
    value: T;
    extra?: J;
}

export interface Icon {
    icon: string;
}

export interface LabelCode<T> {
    label: string;
    code: T;
}

export interface CommonMaster<T> {
    name: string;
    languageCode: string;
    value: LabelValue<T>[];
}

export interface Status {
    status: number;
}