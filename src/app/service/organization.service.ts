import { Injectable } from '@angular/core';


export interface Organization{
  organizationName: string;
  typeOfOrganization: string;
  subscriptionPlan: string;
  status: string;
}
@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  getClientMedium() {
    return Promise.resolve(this.getClientsData().slice(0, 30));
  }

  getClientsData() {
    return [
      {        
        organizationName: 'St. John Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Apollo clinics',
        typeOfOrganization: 'clinic',
        subscriptionPlan: 'Advanced',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Shalby Hospitals',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Active',
      },
      {        
        organizationName: 'HCG Diagnostics',
        typeOfOrganization: 'Diagnostics',
        subscriptionPlan: 'Advanced',        
        status: 'Active',
      },
      {        
        organizationName: 'Epic Speciality',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Test Organization 2',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Cardio Vascular',
        typeOfOrganization: 'Clinic',
        subscriptionPlan: 'Advanced',        
        status: 'Active',
      },
      {        
        organizationName: 'Test Hospital 2',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Cerner Clinics',
        typeOfOrganization: 'Clinic',
        subscriptionPlan: 'Premium',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Wellness Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Zydus Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Active',
      }, 
      {        
        organizationName: 'St. John Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Apollo clinics',
        typeOfOrganization: 'clinic',
        subscriptionPlan: 'Advanced',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Shalby Hospitals',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Active',
      },
      {        
        organizationName: 'HCG Diagnostics',
        typeOfOrganization: 'Diagnostics',
        subscriptionPlan: 'Advanced',        
        status: 'Active',
      },
      {        
        organizationName: 'Epic Speciality',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Test Organization 2',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Cardio Vascular',
        typeOfOrganization: 'Clinic',
        subscriptionPlan: 'Advanced',        
        status: 'Active',
      },
      {        
        organizationName: 'Test Hospital 2',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Cerner Clinics',
        typeOfOrganization: 'Clinic',
        subscriptionPlan: 'Premium',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Wellness Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Zydus Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Active',
      },
      {        
        organizationName: 'St. John Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Apollo clinics',
        typeOfOrganization: 'clinic',
        subscriptionPlan: 'Advanced',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Shalby Hospitals',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Active',
      },
      {        
        organizationName: 'HCG Diagnostics',
        typeOfOrganization: 'Diagnostics',
        subscriptionPlan: 'Advanced',        
        status: 'Active',
      },
      {        
        organizationName: 'Epic Speciality',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Test Organization 2',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Cardio Vascular',
        typeOfOrganization: 'Clinic',
        subscriptionPlan: 'Advanced',        
        status: 'Active',
      },
      {        
        organizationName: 'Test Hospital 2',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Cerner Clinics',
        typeOfOrganization: 'Clinic',
        subscriptionPlan: 'Premium',        
        status: 'Inactive',
      },
      {        
        organizationName: 'Wellness Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Basic',        
        status: 'Active',
      },
      {        
        organizationName: 'Zydus Hospital',
        typeOfOrganization: 'Hospital',
        subscriptionPlan: 'Premium',        
        status: 'Active',
      },   
    ]; 
}
}