import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../directive/page-header.directive';

interface mapPractices{
  name: string;
  code: string;
}
@Component({
  selector: 'app-add-edit-provider',
  imports: [CommonModule,
            FormsModule,
            DropdownModule,
            SelectModule,
            InputTextModule,
            DatePickerModule,
            FileUploadModule,
            CheckboxModule,
            MultiSelectModule,
            ButtonModule,
            SelectButton,
            ToolbarModule,
            DividerModule,
            PageHeaderDirective],
  templateUrl: './add-edit-provider.component.html',
  styleUrl: './add-edit-provider.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService]
})
export class AddEditProviderComponent {
MappedPractices!: mapPractices[];
  constructor(private messageService: MessageService,
              private router: Router
  ) {}
  dropdownItem: any = null;
  dropdownItems = [
    { name: 'Dr.', code: 'Dr.' },
    { name: 'Prof', code: 'Prof' },
    { name: 'Mr.', code: 'Mr.' },
    { name: 'Mrs.', code: 'Mrs.' },
    { name: 'Ms.', code: 'Ms.' },
    { name: 'Master', code: 'Master' },
    { name: 'Hon', code: 'Hon' },
  ];
  showOtherInput: boolean = false;
  calendarValue: any = null;
  Gender: any = null;
  GenderList = [
    { name: 'Male', code: 'Male' },
    { name: 'Female', code: 'FeMale' },
    { name: 'Unknown', code: 'Unknown' },
    { name: 'Prefer Not to Say', code: 'Prefer Not to Say' },
    { name: 'Others', code: 'Others' },
  ];
  otherGender: string = '';
  Licence: any = null;
  LicenceList = [
    {name: 'National Medical Commission', code: 'NMC'},
    {name: 'Dental Council of India', code: 'DCI'},
    {name: 'Pharmacy Council of India', code: 'NMC'},
    {name: 'Indian Nursing Council', code: 'NMC'},
    {name: 'Central Council of Indian Medicine', code: 'NMC'},
    {name: 'Rehabilitation Council of India', code: 'NMC'},
    {name: 'All India Institute of Medical Sciences', code: 'NMC'},
  ];
  LicenceExpiryValue: any = null;
  uploadedFiles: any[] = [];
  practices: mapPractices[] = [
    {name: 'General Physician', code: 'General Physician'},
    {name: 'Wrapper', code: 'Wrapper'},
    {name: 'Rau Cardio', code: 'Rau Cardio'},
    {name: 'Blossom', code: 'Blossom'},
    {name: 'Full Moon', code: 'Full Moon'},
  ];
  practice: any = null;
  Service: any = null;
  Specialities = [
  { name: 'General Surgery', code: 'General Surgery' },
  { name: 'Family Medicine', code: 'Family Medicine' },
  { name: 'Internal Medicine', code: 'Internal Medicine' },
  { name: 'Cardiology', code: 'Cardiology' },
  { name: 'Neurology', code: 'Neurology' },
  { name: 'Nephrology', code: 'Nephrology' },
  { name: 'Gastroenterology', code: 'Gastroenterology' },
  { name: 'Pulmonology', code: 'Pulmonology' },
  { name: 'Endocrinology', code: 'Endocrinology' },
  { name: 'Hematology', code: 'Hematology' },
  { name: 'Oncology', code: 'Oncology' },
  { name: 'Rheumatology', code: 'Rheumatology' },
  { name: 'Orthopedic Surgery', code: 'Orthopedic Surgery' },
  { name: 'Neurosurgery', code: 'Neurosurgery' },
  { name: 'Cardiothoracic Surgery', code: 'Cardiothoracic Surgery' },
  { name: 'Plastic & Reconstructive Surgery', code: 'Plastic & Reconstructive Surgery' },
  ];
  consultationMode: any[] = [];
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  daysoptions = [
    { name: 'Monday', value: 'Monday' },
    { name: 'Tuesday', value: 'Tuesday' },
    { name: 'Wednesday', value: 'Wednesday' },
    { name: 'Thursday', value: 'Thursday' },
    { name: 'Friday', value: 'Friday' },
    { name: 'Saturday', value: 'Saturday' },
    { name: 'Sunday', value: 'Sunday' }
  ];
  startTime = '08:00';
  endTime = '09:00';
  consultationFee = '';
  feeError = false;
  Paymentopt: any = null;
  paymentoptions = [
    { name: 'Cash', code: 'Cash' },
    { name: 'Credit Card', code: 'Credit Card' },
    { name: 'Debit Card', code: 'Debit Card' },
    { name: 'UPI', code: 'UPI' }
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
  selectedInsuranceProvider: any = null;
  
  onDropdownChange() {
    this.showOtherInput = this.dropdownItem?.code === 'Other';
  }

  onGenderChange() {
    this.showOtherInput = this.Gender?.code === 'Others'; 
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  }

  validateFee() {
    this.feeError = !this.consultationFee;
  }

  navigateToListPage(){
    this.router.navigateByUrl('/home/provider/list');
  }
}
