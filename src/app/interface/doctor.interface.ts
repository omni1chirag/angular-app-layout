export interface Doctor {
    doctorId: string;
    title: string;
    firstName: string;
    lastName: string;
    specialities: string;
}

interface Clinic {
    clinicId: string;
    clinicName: string;
    mobileNumber: string;
    email: string;
    address: string;
    city: string;
    country: string;
    pincode: string;
    state: string;
}

export interface DoctorVisitDTO {
    doctor: Doctor;
    clinic: Clinic;
}