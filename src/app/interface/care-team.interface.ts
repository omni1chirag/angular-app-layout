export interface CreateCareTeam {
    role: Role;
    careAgency: CareAgency;
    firstName: string;
    lastName: string;
    memberSpeciality: number[];
    phone: string;
    emailAddress: string;
    status: number | null;
    contactPerson: string | null;
    contactPersonPhone: string | null;
    availableDays: number[];
    slotStartTime: string | null;
    slotEndTime: string | null;
    preferredLanguages: string[] | null;
    crossGenderService: number | null;
    homeStay: number | null;
    workingRadius: string | null;
    restrictions: string | null;
    consultationFee: string | null;
    visitType: string | null;
    serviceGst: number | null;
    chargePerAppointment: string | null;
    qualifications: Qualification[];
}



export interface CareTeamResponse {
    careTeamId: string | null;
    firstName: string | null;
    lastName: string | null;
    role: Role | null;
    memberSpeciality: number[] | null;
    phone: string | null;
    emailAddress: string | null;
    status: number | null;
    careAgency: CareAgency | null;
    contactPerson: string | null;
    contactPersonPhone: string | null;
    availableDays: number[] | null;
    slotStartTime: string | null;
    slotEndTime: string | null;
    preferredLanguages: string[] | null;
    crossGenderService: number | null;
    homeStay: number | null;
    workingRadius: string | null;
    restrictions: string | null;
    consultationFee: string | null;
    visitType: number | null;
    serviceGst: string | null;
    chargePerAppointment: string | null;
    qualifications: Qualification[];
}

export interface Role {
    roleId?: string | null;
}

export interface CareAgency {
    careAgencyId?: string | null;
}


export interface Qualification {
    qualificationId: string | null;
    degree: string | null;
    universityInstitute: string | null;
    yearOfCompletion: Date | null;
    registrationNumber: string | null;
    uploadCertificate: string | null;
}

export interface CareTeamList {
  careTeamId: string | null;
  firstName: string | null;
  lastName: string | null;
  status: number | null;
  role: string | null;
  phone: string | null;
  emailAddress: string | null;
  slotStartTime: string | null;
  slotEndTime: string | null;
  agency: string | null;
}
