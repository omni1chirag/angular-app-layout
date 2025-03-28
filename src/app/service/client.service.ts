import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the Client model
export interface Client {
  id: string;
  name: string;
  type: 'Individual' | 'Organization';
  specialty?: string; // Only for individual providers
  contactNumber: string;
  email: string;
  address: string;
  registeredOn: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {

  getClientSmall() {
    return Promise.resolve(this.getClientsData().slice(0, 10));
  }

  getClientMedium() {
    return Promise.resolve(this.getClientsData().slice(0, 30));
  }

  getClientsData() {
    return [
      {
        id: '3000',
        name: 'Dr. Emily Wilson, MD',
        type: 'Individual',
        specialty: 'Cardiology',
        contactNumber: '+91 11 5555-0234',
        email: 'ewilson@heartcare.com',
        address: '123 Cardiac Lane',
        registeredOn: new Date('2020-03-15'),
        status: 'Approved'
      },
      {
        id: '3001',
        name: 'City General Hospital',
        type: 'Organization',
        contactNumber: '+91 11 5555-1122',
        email: 'info@citygeneral.org',
        address: '456 Health Parkway',
        registeredOn: new Date('2015-07-01'),
        status: 'Rejected'
      },
      {
        id: '3002',
        name: 'Sarah Johnson, PT',
        type: 'Individual',
        specialty: 'Physical Therapy',
        contactNumber: '+91 11 5555-3344',
        email: 'sjohnson@movewell.com',
        address: '789 Mobility Road',
        registeredOn: new Date('2021-09-22'),
        status: 'Approved'
      },
      {
        id: '3003',
        name: 'Precision Diagnostics Lab',
        type: 'Organization',
        contactNumber: '+91 11 5555-5566',
        email: 'services@preclab.com',
        address: '321 Test Street',
        registeredOn: new Date('2022-01-10'),
        status: 'Pending'
      },
      {
        id: '3004',
        name: 'Dr. Michael Chen, DDS',
        type: 'Individual',
        specialty: 'Dentistry',
        contactNumber: '+91 11 5555-7788',
        email: 'mchen@brightsmile.com',
        address: '654 Enamel Avenue',
        registeredOn: new Date('2019-11-05'),
        status: 'Approved'
      },
      {
        id: '3005',
        name: 'Mental Wellness Center',
        type: 'Organization',
        contactNumber: '+91 11 5555-9900',
        email: 'help@mwcenter.org',
        address: '987 Mindful Way',
        registeredOn: new Date('2023-02-28'),
        status: 'Rejected'
      },
      {
        id: '3006',
        name: 'Linda Roberts, RN',
        type: 'Individual',
        specialty: 'Pediatric Nursing',
        contactNumber: '+91 11 5555-1212',
        email: 'lroberts@childcare.com',
        address: '234 Growth Street',
        registeredOn: new Date('2018-06-15'),
        status: 'Pending'
      },
      {
        id: '3007',
        name: 'Advanced Imaging Center',
        type: 'Organization',
        contactNumber: '+91 11 5555-3434',
        email: 'scan@advimaging.com',
        address: '567 Radiance Blvd',
        registeredOn: new Date('2020-12-01'),
        status: 'Approved'
      },
      {
        id: '3008',
        name: 'Dr. David Kim, OD',
        type: 'Individual',
        specialty: 'Optometry',
        contactNumber: '+91 11 5555-5656',
        email: 'dkim@clearvison.com',
        address: '890 Focus Circle',
        registeredOn: new Date('2022-08-14'),
        status: 'Approved'
      },
      {
        id: '3009',
        name: 'Regional Blood Bank',
        type: 'Organization',
        contactNumber: '+91 11 5555-7878',
        email: 'donate@bloodbank.org',
        address: '123 Lifesave Road',
        registeredOn: new Date('2017-04-30'),
        status: 'Approved'
      },
      {
        id: '3010',
        name: 'Jessica Brown, LCSW',
        type: 'Individual',
        specialty: 'Clinical Social Work',
        contactNumber: '+91 11 5555-9090',
        email: 'jbrown@mentalhealth.com',
        address: '456 Balance Lane',
        registeredOn: new Date('2021-05-19'),
        status: 'Approved'
      },
      {
        id: '3011',
        name: 'Ortho Care Center',
        type: 'Organization',
        contactNumber: '+91 11 5555-2323',
        email: 'support@orthocare.com',
        address: '789 Bone Street',
        registeredOn: new Date('2019-03-22'),
        status: 'Approved'
      },
      {
        id: '3012',
        name: 'Dr. Robert Miller, PhD',
        type: 'Individual',
        specialty: 'Clinical Psychology',
        contactNumber: '+91 11 5555-4545',
        email: 'rmiller@mindcare.com',
        address: '321 Cognition Avenue',
        registeredOn: new Date('2020-10-10'),
        status: 'Approved'
      },
      {
        id: '3013',
        name: 'Women\'s Health Clinic',
        type: 'Organization',
        contactNumber: '+91 11 5555-6767',
        email: 'care@whclinic.org',
        address: '654 Feminine Way',
        registeredOn: new Date('2023-07-01'),
        status: 'Pending'
      },
      {
        id: '3014',
        name: 'Karen White, NP',
        type: 'Individual',
        specialty: 'Family Medicine',
        contactNumber: '+91 11 5555-8989',
        email: 'kwhite@primarycare.com',
        address: '987 Wellness Road',
        registeredOn: new Date('2016-09-12'),
        status: 'Approved'
      },
      {
        id: '3015',
        name: 'Pediatric Associates',
        type: 'Organization',
        contactNumber: '+91 11 5555-1010',
        email: 'info@pediatricassoc.com',
        address: '123 Growth Lane',
        registeredOn: new Date('2018-11-25'),
        status: 'Approved'
      },
      {
        id: '3016',
        name: 'Dr. James Wilson, DC',
        type: 'Individual',
        specialty: 'Chiropractic',
        contactNumber: '+91 11 5555-1111',
        email: 'jwilson@spinecare.com',
        address: '456 Alignment Street',
        registeredOn: new Date('2022-04-05'),
        status: 'Pending'
      },
      {
        id: '3017',
        name: 'Advanced Dermatology',
        type: 'Organization',
        contactNumber: '+91 11 5555-2222',
        email: 'contact@advderm.com',
        address: '789 Complexion Road',
        registeredOn: new Date('2020-08-18'),
        status: 'Pending'
      },
      {
        id: '3018',
        name: 'Susan Lee, RD',
        type: 'Individual',
        specialty: 'Nutrition',
        contactNumber: '+91 11 5555-3333',
        email: 'slee@eatwell.com',
        address: '321 Nourish Avenue',
        registeredOn: new Date('2019-12-03'),
        status: 'Approved'
      },
      {
        id: '3019',
        name: 'Cardiac Care Network',
        type: 'Organization',
        contactNumber: '+91 11 5555-4444',
        email: 'info@cardiacnetwork.org',
        address: '654 Pulse Parkway',
        registeredOn: new Date('2017-06-20'),
        status: 'Approved'
      },
      {
        id: '3020',
        name: 'Dr. Richard Davis, DO',
        type: 'Individual',
        specialty: 'Osteopathic Medicine',
        contactNumber: '+91 11 5555-5555',
        email: 'rdavis@wholebody.com',
        address: '987 Holistic Way',
        registeredOn: new Date('2021-02-14'),
        status: 'Approved'
      },
      {
        id: '3021',
        name: 'Metro Urgent Care',
        type: 'Organization',
        contactNumber: '+91 11 5555-6666',
        email: 'visit@metrourgent.org',
        address: '123 Emergency Road',
        registeredOn: new Date('2023-01-05'),
        status: 'Approved'
      },
      {
        id: '3022',
        name: 'Lisa Green, LMT',
        type: 'Individual',
        specialty: 'Massage Therapy',
        contactNumber: '+91 11 5555-7777',
        email: 'lgreen@relaxclinic.com',
        address: '456 Tension Release Lane',
        registeredOn: new Date('2018-04-30'),
        status: 'Approved'
      },
      {
        id: '3023',
        name: 'Vision Plus Centers',
        type: 'Organization',
        contactNumber: '+91 11 5555-8888',
        email: 'see@visionplus.com',
        address: '789 Clarity Boulevard',
        registeredOn: new Date('2020-11-11'),
        status: 'Pending'
      },
      {
        id: '3024',
        name: 'Dr. Nancy Taylor, PhD',
        type: 'Individual',
        specialty: 'Neuropsychology',
        contactNumber: '+91 11 5555-9999',
        email: 'ntaylor@brainhealth.com',
        address: '321 Cortex Avenue',
        registeredOn: new Date('2019-07-07'),
        status: 'Rejected'
      },
      
      {
        id: '3025',
        name: 'MediCare Hospital',
        type: 'Organization',
        contactNumber: '+91 9823456789',
        email: 'contact@medicare.com',
        address: '456 Park Street, Mumbai, India',
        registeredOn: new Date('2022-12-10'),
        status: 'Approved'
      },
      {
        id: '3026',
        name: 'Dr. Priya Sharma',
        type: 'Individual',
        specialty: 'Dentist',
        contactNumber: '+91 9123456780',
        email: 'priya.sharma@dentalcare.com',
        address: '21 Residency Road, Pune, India',
        registeredOn: new Date('2023-05-22'),
        status: 'Pending'
      },
      {
        id: '3027',
        name: 'Apollo Diagnostics',
        type: 'Organization',
        contactNumber: '+91 9012345678',
        email: 'support@apollodiagnostics.com',
        address: '789 Health Avenue, Delhi, India',
        registeredOn: new Date('2021-08-30'),
        status: 'Approved'
      },
      {
        id: '3028',
        name: 'Dr. Ramesh Iyer',
        type: 'Individual',
        specialty: 'Neurologist',
        contactNumber: '+91 8800123456',
        email: 'ramesh.iyer@neuroclinic.com',
        address: '56 Green Street, Chennai, India',
        registeredOn: new Date('2022-11-12'),
        status: 'Approved'
      },
      {
        id: '3029',
        name: 'Sunrise Healthcare',
        type: 'Organization',
        contactNumber: '+91 8899001122',
        email: 'info@sunrisehealth.com',
        address: '12 Whitefield, Bangalore, India',
        registeredOn: new Date('2020-06-20'),
        status: 'Approved'
      },
      {
        id: '3030',
        name: 'Dr. Neha Verma',
        type: 'Individual',
        specialty: 'Pediatrician',
        contactNumber: '+91 7001234567',
        email: 'neha.verma@kidsclinic.com',
        address: '34 South Avenue, Hyderabad, India',
        registeredOn: new Date('2023-02-18'),
        status: 'Approved'
      },
      {
        id: '3031',
        name: 'Global Eye Center',
        type: 'Organization',
        contactNumber: '+91 9600112233',
        email: 'contact@globaleye.com',
        address: '101 Central Market, Kolkata, India',
        registeredOn: new Date('2021-07-07'),
        status: 'Pending'
      },
      {
        id: '3032',
        name: 'Dr. Anil Kapoor',
        type: 'Individual',
        specialty: 'Orthopedic Surgeon',
        contactNumber: '+91 8800223344',
        email: 'anil.kapoor@bonecare.com',
        address: '45 MG Road, Lucknow, India',
        registeredOn: new Date('2022-10-01'),
        status: 'Approved'
      },
      {
        id: '3033',
        name: 'Rainbow Children’s Hospital',
        type: 'Organization',
        contactNumber: '+91 7550011223',
        email: 'info@rainbowhospitals.com',
        address: '200 Park View, Bangalore, India',
        registeredOn: new Date('2019-03-25'),
        status: 'Approved'
      },
      {
        id: '3034',
        name: 'Dr. Kavita Mehta',
        type: 'Individual',
        specialty: 'Gynecologist',
        contactNumber: '+91 9301122334',
        email: 'kavita.mehta@womensclinic.com',
        address: '10 Residency Towers, Jaipur, India',
        registeredOn: new Date('2021-09-09'),
        status: 'Pending'
      },
      {
        id: '3035',
        name: 'Elite Dental Care',
        type: 'Organization',
        contactNumber: '+91 8223344556',
        email: 'support@elitedental.com',
        address: '67 Smile Street, Chennai, India',
        registeredOn: new Date('2020-12-05'),
        status: 'Pending'
      },
      {
        id: '3036',
        name: 'Dr. Rajesh Gupta',
        type: 'Individual',
        specialty: 'General Physician',
        contactNumber: '+91 8009876543',
        email: 'rajesh.gupta@familydoctor.com',
        address: '55 MG Road, Pune, India',
        registeredOn: new Date('2022-06-15'),
        status: 'Approved'
      },
      {
        id: '3037',
        name: 'Wellness Diagnostic Lab',
        type: 'Organization',
        contactNumber: '+91 7700987654',
        email: 'info@wellnesslabs.com',
        address: '98 Health Street, Delhi, India',
        registeredOn: new Date('2018-04-10'),
        status: 'Approved'
      },
      {
        id: '3038',
        name: 'Dr. Shalini Rao',
        type: 'Individual',
        specialty: 'Psychiatrist',
        contactNumber: '+91 9201235678',
        email: 'shalini.rao@mentalhealth.com',
        address: '33 Peace Avenue, Mumbai, India',
        registeredOn: new Date('2023-01-25'),
        status: 'Pending'
      },
      {
        id: '3039',
        name: 'Holistic Care Center',
        type: 'Organization',
        contactNumber: '+91 8765432100',
        email: 'support@holisticcare.com',
        address: '88 Yoga Road, Bangalore, India',
        registeredOn: new Date('2017-11-30'),
        status: 'Approved'
      },
      {
        id: '3040',
        name: 'Dr. Surya Prakash',
        type: 'Individual',
        specialty: 'Dermatologist',
        contactNumber: '+91 7000111222',
        email: 'surya.prakash@skincare.com',
        address: '99 Skin Street, Hyderabad, India',
        registeredOn: new Date('2022-05-12'),
        status: 'Approved'
      },
      {
        id: '3041',
        name: 'MedStar Multispeciality Clinic',
        type: 'Organization',
        contactNumber: '+91 7557788990',
        email: 'info@medstarclinic.com',
        address: '202 Apollo Towers, Delhi, India',
        registeredOn: new Date('2021-03-17'),
        status: 'Rejected'
      },
      {
        id: '3042',
        name: 'Dr. Aarti Joshi',
        type: 'Individual',
        specialty: 'Endocrinologist',
        contactNumber: '+91 7899001123',
        email: 'aarti.joshi@diabetesclinic.com',
        address: '77 Sugar Lane, Pune, India',
        registeredOn: new Date('2023-06-20'),
      },
      {
        id: '3043',
        name: 'CityCare Polyclinic',
        type: 'Organization',
        contactNumber: '+91 9998887766',
        email: 'support@citycare.com',
        address: '45 Central Plaza, Kolkata, India',
        registeredOn: new Date('2020-09-09'),
        status: 'Approved'
      },
      {
        id: '3044',
        name: 'Dr. Vikram Shetty',
        type: 'Individual',
        specialty: 'Urologist',
        contactNumber: '+91 9876004321',
        email: 'vikram.shetty@kidneycare.com',
        address: '22 River Road, Chennai, India',
        registeredOn: new Date('2021-12-05'),
        status: 'Approved'
      },
      {
        id: '3045',
        name: 'John Doe',
        type: 'Individual',
        specialty: 'Cardiologist',
        contactNumber: '+91 9876543210',
        email: 'johndoe@example.com',
        address: '123 MG Road, Bangalore, India',
        registeredOn: new Date('2023-01-15'),
        status: 'Approved'
      },
      {
        id: '3046',
        name: 'HealthFirst Diagnostics',
        type: 'Organization',
        contactNumber: '+91 7002345678',
        email: 'info@healthfirst.com',
        address: '102 Green Avenue, Bangalore, India',
        registeredOn: new Date('2020-01-05'),
        status: 'Pending'
      },
      {
        id: '3047',
        name: 'Dr. Sanjay Patel',
        type: 'Individual',
        specialty: 'Gastroenterologist',
        contactNumber: '+91 8800991122',
        email: 'sanjay.patel@digestivecare.com',
        address: '19 Ocean View, Chennai, India',
        registeredOn: new Date('2023-02-12'),
        status: 'Approved'
      },
      {
        id: '3048',
        name: 'Sunrise Dental Clinic',
        type: 'Organization',
        contactNumber: '+91 9223344556',
        email: 'support@sunrisedental.com',
        address: '56 Smile Lane, Pune, India',
        registeredOn: new Date('2019-06-30'),
        status: 'Rejected'
      },
      {
        id: '3049',
        name: 'Dr. Arvind Rao',
        type: 'Individual',
        specialty: 'Pulmonologist',
        contactNumber: '+91 7778889990',
        email: 'arvind.rao@lungspecialist.com',
        address: '87 Fresh Air Road, Hyderabad, India',
        registeredOn: new Date('2023-10-18'),
        status: 'Approved'
      },
      {
        id: '3050',
        name: 'Dr. Sneha Kapoor',
        type: 'Individual',
        specialty: 'Oncologist',
        contactNumber: '+91 9823456781',
        email: 'sneha.kapoor@cancercare.com',
        address: '14 Hope Street, Mumbai, India',
        registeredOn: new Date('2022-08-15'),
        status: 'Rejected'
      }
    ];
  }
}
