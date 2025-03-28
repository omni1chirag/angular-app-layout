import { Injectable } from '@angular/core';

export interface Provider{
  providerName: string;
  Specialization: string;
  practiceName: string;
  organizationName: string;
  ConsultationMode: string;
  Status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  getClientMedium() {
    return Promise.resolve(this.getClientsData().slice(0, 30));
  }

  getClientsData() {
    return [
    {
        providerName: 'Dr. John Doe',
        Specialization: 'Cardiologist', 
        practiceName: 'St. John Hospital',
        organizationName: 'St. John Hospital',
        ConsultationMode: 'In-Person',
        Status: 'Active',        
  },
  {
    providerName: 'Dr. Jane Doe',
    Specialization: 'Dermatologist',
    practiceName: 'Apollo clinics',
    organizationName: 'Apollo clinics',
    ConsultationMode: 'Online',
    Status: 'Inactive',
  },
  {
    providerName: 'Dr. John Doe',
    Specialization: 'Cardiologist',
    practiceName: 'Shalby Hospitals',
    organizationName: 'Shalby Hospitals',
    ConsultationMode: 'In-Person',
    Status: 'Active',
  },
  {
    providerName: 'Dr. Jane Doe',
    Specialization: 'Dermatologist',
    practiceName: 'HCG Diagnostics',
    organizationName: 'HCG Diagnostics',
    ConsultationMode: 'Online',
    Status: 'Active',
  },
  {
    providerName: 'Dr. John Doe',
    Specialization: 'Cardiologist',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    ConsultationMode: 'In-Person',
    Status: 'Inactive',
  },
  {
    providerName: 'Dr. Jane Doe',
    Specialization: 'Dermatologist',
    practiceName: 'Test Organization 2',
    organizationName: 'Test Organization 2',
    ConsultationMode: 'Online',
    Status: 'Inactive',
  },
];
  }

}
