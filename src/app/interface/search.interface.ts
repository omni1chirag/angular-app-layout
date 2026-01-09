import { LabelValue } from './common.interface';

export type SearchResultType = MappedDoctor | MappedClinic | MappedSpeciality;

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
}

export interface Doctor {
  doctorId: string;
  fullName: string;
  specialitiesText: string;
  city: string;
  consultationFee: number;
  consultationMode: string[];
  firstName?: string;
  lastName?: string;
  consultationCharges: ConsultationCharge[];
}

export interface ConsultationCharge {
  displayAmount: number;
  payableAmount: number;
  appointmentType: string;
}
export interface Clinic {
  clinicId: string;
  clinicName: string;
  city: string;
  doctorsCount: number;
}

export interface Speciality {
  specialityId: string;
  name: string;
  doctorsCount: number;
}

export interface SearchResponse {
  doctors: SearchResult<Doctor>;
  clinics: SearchResult<Clinic>;
  specialities: SearchResult<Speciality>;
}

export interface MappedDoctor {
  type: 'doctor';
  id: string;
  name: string;
  category?: string;
  city?: string;
  fee?: number;
  mode?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  imageError?: boolean;
  consultationCharges: ConsultationCharge[];
}

export interface MappedClinic {
  type: 'clinic';
  id: string;
  name: string;
  location?: string;
  doctorsCount?: number;
  city?: string;
  imageUrl?: string;
  imageError?: boolean;
}

export interface MappedSpeciality {
  type: 'speciality';
  id: string;
  name: string;
  doctorsCount?: number;
  icon: string;
  iconColor: string;
  city?: string;
}

export interface DoctorList {
  doctorId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  city: string;
  specialitiesText: string;
  consultationFee: number;
  consultationMode: string[];
  yearOfExperience: number;
  gender: LabelValue<number>;
  selectedClinicId?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  imageError?: boolean;
  consultationCharges?: ConsultationCharge[];
}

export interface ClinicList {
  readonly clinicId: string;
  readonly clinicName: string;
  readonly city: string;
  readonly address: string;
  readonly pincode: string;
  readonly state: string;
  readonly country: string;
  readonly mobileNumber: string;
  readonly email: string;
  readonly doctorsCount: number;
  readonly specialitiesText: string;
  readonly imageUrl: string;
  imageError: boolean;
}
