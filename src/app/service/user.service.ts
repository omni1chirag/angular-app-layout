import { Injectable } from '@angular/core';

export interface User {
  userName: string;
  userType: string;
  practiceName: string;
  organizationName: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getClientMedium() {
    return Promise.resolve(this.getClientsData().slice(0, 30));
  }

  getClientsData() {
    return [
    {
        userName: 'John Doe',
        userType: 'Admin', 
        practiceName: 'St. John Hospital',
        organizationName: 'St. John Hospital',
        status: 'Active',        
  },
  {
    userName: 'Jane Doe',
    userType: 'User',
    practiceName: 'Apollo clinics',
    organizationName: 'Apollo clinics',
    status: 'Inactive',
  },
  {
    userName: 'John Doe',
    userType: 'Admin',
    practiceName: 'Shalby Hospitals',
    organizationName: 'Shalby Hospitals',
    status: 'Active',
  },
  {
    userName: 'Jane Doe',
    userType: 'User',
    practiceName: 'HCG Diagnostics',
    organizationName: 'HCG Diagnostics',
    status: 'Active',
  },
  {
    userName: 'John Doe',
    userType: 'Admin',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Inactive',
  },
  {
    userName: 'Jane Doe',
    userType: 'User',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Active',
  },
  {
    userName: 'John Doe',
    userType: 'Admin',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Active',
  },
  {
    userName: 'Jane Doe',
    userType: 'User',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Active',
  },
  {
    userName: 'John Doe',
    userType: 'Admin',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Active',
  },
  {
    userName: 'Jane Doe',
    userType: 'User',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Active',
  },
  {
    userName: 'John Doe',
    userType: 'Admin',
    practiceName: 'Epic Speciality',
    organizationName: 'Epic Speciality',
    status: 'Active',
  }
];
  }
}
