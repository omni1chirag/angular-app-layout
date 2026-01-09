export interface PatientMapping {
  userMappingId: string;
  patientName: string;
  patientId: string;
  relation: number;
  eligibleForOptIn: boolean;
  status: number;
}

export interface CreatePatient {
    joinCurrentUser: boolean | null;
    joinCurrentUserAs: number | null;
    userId: string | null;
    stillFamilyMember: boolean;
    title: string | null;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: number;
    genderFreeText: string | null;
    dateOfBirth: Date;
    maritalStatus: number | null;
    maritalStatusFreeText: string | null;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
    email: string;
    mobileNumber: string;
    alternateMobileNumber: string | null;
    status: number | null;
    aadharNumber: string;
    abhaId: string | null;
    bloodGroup: string | null;
    profilePicture: string | null;
    preferredLanguages: string[] | null;
    emergencyContacts: EmergencyContact[];
    communicationModes: number[] | null;
    source: string | null;
}

export interface EmergencyContact {
    contactId: string | null;
    contactName: string;
    contactNumber: string;
    contactRelation: number;
    orderPosition: number;
}

export interface PatientConsentOTP {
    patientId: string;
    otpType: string;
}

export interface PatientOptForUser {
  otp: string;              // 6-digit OTP
  email: string;            // valid email
  mobileNumber: string;     // exactly 10 digits
  stillFamilyMember: boolean;
}

export interface OptForUserOtpDTO {
  otpType: string;    
  email: string;
  mobileNumber: string;
}

export interface PatientProfileSelectionDTO {
  patientId: string;        // UUID
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;      // LocalDate -> ISO string (e.g., "2025-10-01")
  city: string;
  userId: string;           // UUID
  userFirstName: string;
  userLastName: string;
  userMappingId: string;    // UUID
  relation: number;
  relationName: string;
}


export interface Patient {
    patientId: string | null;
    title: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;

    gender: number | null;
    genderFreeText: string | null;

    dateOfBirth: Date | null;

    maritalStatus: number | null;
    maritalStatusFreeText: string | null;

    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    pincode: string | null;

    email: string | null;
    mobileNumber: string | null;
    alternateMobileNumber: string | null;

    status: number | null;

    aadharNumber: string | null;
    abhaId: string | null;
    bloodGroup: string | null;

    preferredLanguages: string[] | null;

    emergencyContacts: EmergencyContact[];

    communicationModes: number[] | null;
}
