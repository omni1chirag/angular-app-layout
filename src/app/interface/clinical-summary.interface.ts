export interface ClinicProfileData {
  clinicId: string;
  clinicName: string;
  city: string;
  address1: string;
  address2: string;
  state: string;
  country: string;
  pincode: string;
  mobileNumber: string;
  email: string;
}

export interface DoctorProfileData {
  doctorId: string;
  title: string;
  firstName: string;
  lastName: string;
  specialities: string; // e.g., comma-separated specialization IDs or names
}
