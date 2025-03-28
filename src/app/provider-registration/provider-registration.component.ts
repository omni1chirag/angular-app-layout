import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-provider-registration',
  imports: [CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    SelectButtonModule,
    InputTextModule,
    CheckboxModule,
    DatePickerModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    InputOtpModule,
    TabsModule,
    PasswordModule,
    MultiSelectModule,
    ToolbarModule,
    FileUploadModule,
    DividerModule],
  providers: [MessageService],

  templateUrl: './provider-registration.component.html',
  styleUrl: './provider-registration.component.scss'
})
export class ProviderRegistrationComponent implements OnInit {
  isBrowser: any;


  constructor(private messageService: MessageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

  }
  ngOnInit(): void {
    if (this.isBrowser) {
      const provider = localStorage.getItem('provider');
      if (provider) {
        this.provider = new ProviderModel(<Provider>JSON.parse(provider));
      }

    }
  }

  provider: Provider = new ProviderModel({});


  dropdownItems = [
    { name: 'Dr.', code: 'Dr.' },
    { name: 'Prof', code: 'Prof' },
    { name: 'Mr.', code: 'Mr.' },
    { name: 'Mrs.', code: 'Mrs.' },
    { name: 'Ms.', code: 'Ms.' },
    { name: 'Master', code: 'Master' },
    { name: 'Hon', code: 'Hon' },
  ];
  GenderList = [
    { name: 'Male', code: 'Male' },
    { name: 'Female', code: 'FeMale' },
    { name: 'Unknown', code: 'Unknown' },
    { name: 'Prefer Not to Say', code: 'Prefer Not to Say' },
    { name: 'Others', code: 'Others' },
  ];
  LicenceList = [
    { name: 'National Medical Commission', code: 'NMC' },
    { name: 'Dental Council of India', code: 'DCI' },
    { name: 'Pharmacy Council of India', code: 'NMC' },
    { name: 'Indian Nursing Council', code: 'NMC' },
    { name: 'Central Council of Indian Medicine', code: 'NMC' },
    { name: 'Rehabilitation Council of India', code: 'NMC' },
    { name: 'All India Institute of Medical Sciences', code: 'NMC' },
  ];

  spaciality = [
    { "name": "General Medicine", "code": "General Medicine" },
    { "name": "General Surgery", "code": "General Surgery" },
    { "name": "Family Medicine", "code": "Family Medicine" },
    { "name": "Internal Medicine", "code": "Internal Medicine" },
    { "name": "Cardiology", "code": "Cardiology" },
    { "name": "Neurology", "code": "Neurology" },
    { "name": "Nephrology", "code": "Nephrology" },
    { "name": "Gastroenterology", "code": "Gastroenterology" },
    { "name": "Pulmonology", "code": "Pulmonology" },
    { "name": "Endocrinology", "code": "Endocrinology" },
    { "name": "Hematology", "code": "Hematology" },
    { "name": "Oncology", "code": "Oncology" },
    { "name": "Rheumatology", "code": "Rheumatology" },
    { "name": "Orthopedic Surgery", "code": "Orthopedic Surgery" },
    { "name": "Neurosurgery", "code": "Neurosurgery" },
    { "name": "Cardiothoracic Surgery", "code": "Cardiothoracic Surgery" },
    { "name": "Plastic & Reconstructive Surgery", "code": "Plastic & Reconstructive Surgery" },
    { "name": "Urology", "code": "Urology" },
    { "name": "Ophthalmology", "code": "Ophthalmology" },
    { "name": "ENT (Otorhinolaryngology)", "code": "ENT (Otorhinolaryngology)" },
    { "name": "Colorectal Surgery", "code": "Colorectal Surgery" },
    { "name": "Obstetrics & Gynecology (OB-GYN)", "code": "Obstetrics & Gynecology (OB-GYN)" },
    { "name": "Pediatrics", "code": "Pediatrics" },
    { "name": "Neonatology", "code": "Neonatology" },
    { "name": "Psychiatry", "code": "Psychiatry" },
    { "name": "Clinical Psychology", "code": "Clinical Psychology" },
    { "name": "Radiology", "code": "Radiology" },
    { "name": "Pathology", "code": "Pathology" },
    { "name": "Nuclear Medicine", "code": "Nuclear Medicine" },
    { "name": "Anesthesiology", "code": "Anesthesiology" },
    { "name": "Dermatology", "code": "Dermatology" },
    { "name": "Allergy & Immunology", "code": "Allergy & Immunology" },
    { "name": "Infectious Disease Specialist", "code": "Infectious Disease Specialist" },
    { "name": "Geriatrics", "code": "Geriatrics" },
    { "name": "Pain Management", "code": "Pain Management" },
    { "name": "Ayurveda", "code": "Ayurveda" },
    { "name": "Homeopathy", "code": "Homeopathy" },
    { "name": "Unani Medicine", "code": "Unani Medicine" },
    { "name": "Siddha Medicine", "code": "Siddha Medicine" },
    { "name": "Naturopathy", "code": "Naturopathy" }
  ]
  sub_speciality = [
    { "name": "Interventional Cardiology", "code": "Interventional Cardiology" },
    { "name": "Interventional Cardiology", "code": "Interventional Cardiology" },
    { "name": "Electrophysiology", "code": "Electrophysiology" },
    { "name": "Heart Failure & Transplant Cardiology", "code": "Heart Failure & Transplant Cardiology" },
    { "name": "Pediatric Cardiology", "code": "Pediatric Cardiology" },
    { "name": "Stroke & Vascular Neurology", "code": "Stroke & Vascular Neurology" },
    { "name": "Epilepsy & Seizure Disorders", "code": "Epilepsy & Seizure Disorders" },
    { "name": "Movement Disorders", "code": "Movement Disorders" },
    { "name": "Neurocritical Care", "code": "Neurocritical Care" },
    { "name": "Multiple Sclerosis & Autoimmune Neurology", "code": "Multiple Sclerosis & Autoimmune Neurology" },
    { "name": "Neuro-Oncology", "code": "Neuro-Oncology" },
    { "name": "Pediatric Neurology", "code": "Pediatric Neurology" },
    { "name": "Hepatology", "code": "Hepatology" },
    { "name": "Pancreatic Disorders", "code": "Pancreatic Disorders" },
    { "name": "Inflammatory Bowel Disease", "code": "Inflammatory Bowel Disease" },
    { "name": "Advanced Endoscopy", "code": "Advanced Endoscopy" },
    { "name": "Critical Care Pulmonology", "code": "Critical Care Pulmonology" },
    { "name": "Sleep Medicine", "code": "Sleep Medicine" },
    { "name": "Interventional Pulmonology", "code": "Interventional Pulmonology" },
    { "name": "Pulmonary Hypertension Specialist", "code": "Pulmonary Hypertension Specialist" },
    { "name": "Spine Surgery", "code": "Spine Surgery" },
    { "name": "Sports Medicine", "code": "Sports Medicine" },
    { "name": "Trauma & Fracture Surgery", "code": "Trauma & Fracture Surgery" },
    { "name": "Joint Replacement Surgery", "code": "Joint Replacement Surgery" },
    { "name": "Pediatric Orthopedics", "code": "Pediatric Orthopedics" },
    { "name": "Medical Oncology", "code": "Medical Oncology" },
    { "name": "Surgical Oncology", "code": "Surgical Oncology" },
    { "name": "Radiation Oncology", "code": "Radiation Oncology" },
    { "name": "Pediatric Oncology", "code": "Pediatric Oncology" },
    { "name": "Dialysis & Renal Replacement Therapy", "code": "Dialysis & Renal Replacement Therapy" },
    { "name": "Kidney Transplant Specialist", "code": "Kidney Transplant Specialist" },
    { "name": "Hypertension & Kidney Disease", "code": "Hypertension & Kidney Disease" },
    { "name": "Diabetes Specialist", "code": "Diabetes Specialist" },
    { "name": "Thyroid Disorders", "code": "Thyroid Disorders" },
    { "name": "Reproductive Endocrinology", "code": "Reproductive Endocrinology" },
    { "name": "Neonatology", "code": "Neonatology" },
    { "name": "Pediatric Critical Care", "code": "Pediatric Critical Care" },
    { "name": "Pediatric Infectious Disease", "code": "Pediatric Infectious Disease" },
    { "name": "Cosmetic Dermatology", "code": "Cosmetic Dermatology" },
    { "name": "Dermatopathology", "code": "Dermatopathology" },
    { "name": "Pediatric Dermatology", "code": "Pediatric Dermatology" },
    { "name": "Child & Adolescent Psychiatry", "code": "Child & Adolescent Psychiatry" },
    { "name": "Addiction Psychiatry", "code": "Addiction Psychiatry" },
    { "name": "Geriatric Psychiatry", "code": "Geriatric Psychiatry" },
    { "name": "Forensic Psychiatry", "code": "Forensic Psychiatry" },
    { "name": "Maternal-Fetal Medicine (MFM)", "code": "Maternal-Fetal Medicine (MFM)" },
    { "name": "Gynecologic Oncology", "code": "Gynecologic Oncology" },
    { "name": "Reproductive Endocrinology & Infertility", "code": "Reproductive Endocrinology & Infertility" }
  ]

  Medical_Degree = [
    { "name": "MBBS", "code": "MBBS" },
    { "name": "MD", "code": "MD" },
    { "name": "DO", "code": "DO" },
    { "name": "BAMS", "code": "BAMS" },
    { "name": "BHMS", "code": "BHMS" },
    { "name": "BUMS", "code": "BUMS" },
    { "name": "BSMS", "code": "BSMS" },
    { "name": "BNYS", "code": "BNYS" },
    { "name": "MD", "code": "MD" },
    { "name": "MS", "code": "MS" },
    { "name": "DM", "code": "DM" },
    { "name": "MCh", "code": "MCh" },
    { "name": "BDS", "code": "BDS" },
    { "name": "DDS", "code": "DDS" },
    { "name": "DMD", "code": "DMD" },
    { "name": "MDS", "code": "MDS" },
    { "name": "BSc", "code": "BSc" },
    { "name": "MSc", "code": "MSc" },
    { "name": "DNP", "code": "DNP" },
    { "name": "NP", "code": "NP" },
    { "name": "BPT", "code": "BPT" },
    { "name": "MPT", "code": "MPT" },
    { "name": "BPharm", "code": "BPharm" },
    { "name": "MPharm", "code": "MPharm" },
    { "name": "PharmD", "code": "PharmD" },
    { "name": "BOT", "code": "BOT" },
    { "name": "MOT", "code": "MOT" },
    { "name": "AyD", "code": "AyD" },
    { "name": "ND", "code": "ND" },
    { "name": "MPH", "code": "MPH" }
  ]

  daysoptions = [
    { name: 'Monday', value: 'Monday' },
    { name: 'Tuesday', value: 'Tuesday' },
    { name: 'Wednesday', value: 'Wednesday' },
    { name: 'Thursday', value: 'Thursday' },
    { name: 'Friday', value: 'Friday' },
    { name: 'Saturday', value: 'Saturday' },
    { name: 'Sunday', value: 'Sunday' }
  ];

  insuranceProviders = [
    { name: "Aditya Birla Health Insurance Co. Ltd.", code: "ADITYA_BIRLA" },
    { name: "Care Health Insurance Ltd.", code: "CARE_HEALTH" },
    { name: "ManipalCigna Health Insurance Co. Ltd.", code: "MANIPAL_CIGNA" },
    { name: "Niva Bupa Health Insurance Co. Ltd.", code: "NIVA_BUPA" },
    { name: "Star Health & Allied Insurance Co. Ltd.", code: "STAR_HEALTH" },
    { name: "Bajaj Allianz General Insurance Co. Ltd.", code: "BAJAJ_ALLIANZ" },
    { name: "Bharti AXA General Insurance Co. Ltd.", code: "BHARTI_AXA" },
    { name: "Cholamandalam MS General Insurance Co. Ltd.", code: "CHOLAMANDALAM_MS" },
    { name: "Future Generali India Insurance Co. Ltd.", code: "FUTURE_GENERALI" },
    { name: "HDFC ERGO General Insurance Co. Ltd.", code: "HDFC_ERGO" },
    { name: "ICICI Lombard General Insurance Co. Ltd.", code: "ICICI_LOMBARD" },
    { name: "IFFCO Tokio General Insurance Co. Ltd.", code: "IFFCO_TOKIO" },
    { name: "Kotak Mahindra General Insurance Co. Ltd.", code: "KOTAK_MAHINDRA" },
    { name: "Liberty General Insurance Co. Ltd.", code: "LIBERTY_GENERAL" },
    { name: "National Insurance Co. Ltd.", code: "NATIONAL_INSURANCE" },
    { name: "New India Assurance Co. Ltd.", code: "NEW_INDIA_ASSURANCE" },
    { name: "Oriental Insurance Co. Ltd.", code: "ORIENTAL_INSURANCE" },
    { name: "Reliance General Insurance Co. Ltd.", code: "RELIANCE_GENERAL" },
    { name: "Royal Sundaram General Insurance Co. Ltd.", code: "ROYAL_SUNDARAM" },
    { name: "SBI General Insurance Co. Ltd.", code: "SBI_GENERAL" },
    { name: "Tata AIG General Insurance Co. Ltd.", code: "TATA_AIG" },
    { name: "United India Insurance Co. Ltd.", code: "UNITED_INDIA" },
    { name: "Universal Sompo General Insurance Co. Ltd.", code: "UNIVERSAL_SOMPO" }
  ];

  paymentoptions = [
    { name: 'Cash', code: 'Cash' },
    { name: 'Credit Card', code: 'Credit Card' },
    { name: 'Debit Card', code: 'Debit Card' },
    { name: 'UPI', code: 'UPI' }
  ];

  submit() {
    if(this.isBrowser){
      localStorage.removeItem('provider');
    }
    this.router.navigate(['login']);

  }
}

export interface Provider {
  Paymentopt: any;
  paymentoptions: any;
  insuranceProviders: any[];
  selectedInsuranceProvider: any;
  startTime: any;
  endTime: any;
  consultationFee: any;
  days: any;
  consultationMode: any;
  degree: any;
  subSpecialization: any;
  specialization: any;
  licenceExpiry?: any;
  dob: any;
  gender: any;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  registrationNumber: string;
  licence: string;
  tc: string;
  ac: string;
}

export class ProviderModel {
  Paymentopt: any;
  paymentoptions: any;
  insuranceProviders: any[];
  selectedInsuranceProvider: any;
  startTime: any;
  endTime: any;
  consultationFee: any;
  days: any;
  consultationMode: any;
  degree: any;
  subSpecialization: any;
  specialization: any;
  licenceExpiry?: any;
  dob: any;
  gender: any;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  registrationNumber: string;
  licence: string;
  tc: string;
  ac: string;
  constructor(data: Partial<Provider>) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
  }
}