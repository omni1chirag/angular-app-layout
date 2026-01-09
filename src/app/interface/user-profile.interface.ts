import { EmergencyContact } from "./patient-profile.interface";

export interface UserProfile {
  userId: string;
  organization: {
    organizationId: string;
  };
  role: {
    roleId: string;
  };
  clinics: string[];
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: number;
  genderFreeText: string | null;
  dateOfBirth: string; // ISO string "YYYY-MM-DD"
  departmentId: string | null;
  yearOfExperience: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  email: string;
  mobileNumber: string;
  status: number;
  communicationModes: number[];
  preferredLanguages: string[];
  menuPermissions: string[] | null;
  featurePermissions: string[] | null;
  customerId: string | null;
  aboutMe: string;
}

export interface PatientUserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  preferredLanguages?: string[];
  communicationModes?: string[];
}

export interface PatientDTO {
  patientId?: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: number;
  genderFreeText?: string;
  dateOfBirth?: string;
  maritalStatus?: number;
  maritalStatusFreeText?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  email?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  status?: number;
  aadharNumber?: string;
  abhaId?: string;
  bloodGroup?: string;
  preferredLanguages?: string[];
  emergencyContacts?: EmergencyContact[];
  communicationModes?: number[];
  joinCurrentUser?: boolean
}

