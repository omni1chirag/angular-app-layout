import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';

interface Country {
  name: string;
  code: string;
}
@Component({
  selector: 'app-practice-add-edit',
  imports: [
    AutoCompleteModule,
    FormsModule,
    ReactiveFormsModule, // Add ReactiveFormsModule here
    InputTextModule,
    DatePickerModule,
    AvatarModule,
    ButtonModule,
    FileUploadModule,
    CommonModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    DividerModule,
    ToolbarModule,
    PageHeaderDirective,
    MultiSelectModule
  ],
  templateUrl: './practice-add-edit.component.html',
  styleUrl: './practice-add-edit.component.scss',
  providers: [MessageService]
})
export class PracticeAddEditComponent {
  selectedTypes: any = null;
  autoFilteredValue: any[] = [];
  organizationList!: any[] | [];
  uploadedFiles: any[] = [];
  countries: Country[] | undefined;
  selectedCountry: Country | undefined;
  selectedPracticeType: any = null;
  practiceTypes = [
    { name: 'Hospital', code: 'Hospital' },
    { name: 'Clinic', code: 'Clinic' },
    { name: 'Diagnostic Center', code: 'Diagnostic Center' },
    { name: 'Pharmacy', code: 'Pharmacy' },
    { name: 'Medical Equipment', code: 'Medical Equipment' },
    { name: 'Other', code: 'Other' }
  ];
  showOtherPracticeTypeInput: boolean = false;

  Services: Country[] = [
    { name: 'Cardiology ', code: 'CD ' },
    { name: 'Neurology ', code: 'NR' },
    { name: 'Pulmonology ', code: 'PN' },
    { name: 'Gastroenterology ', code: 'GE' },
    { name: 'Endocrinology ', code: 'ED' },
    { name: 'Nephrology ', code: 'NP' },
    { name: 'Obstetrics & Gynecology ', code: 'OG' },
    { name: 'Pediatrics', code: 'PD' },
    { name: 'Psychology ', code: 'PSY' },
    { name: 'Acupuncture', code: 'AC' }
  ];
  selectedServices!: Country[];

  paymentTypes: any[] = [
    { name: 'Credit/Debit Card', key: 'A' },
    { name: 'UPI (Unified Payments Interface)', key: 'M' },
    { name: 'Cash Payment', key: 'P' },
    { name: 'All', key: 'R' }
];
selectedPaymentMode: any = null;
paymentoptions = [
  { name: 'Cash', code: 'Cash' },
  { name: 'Credit Card', code: 'Credit Card' },
  { name: 'Debit Card', code: 'Debit Card' },
  { name: 'UPI', code: 'UPI' }
];
Paymentopt: any = null;



  constructor(private messageService: MessageService,
              private router: Router
  ) {

  }

  ngOnInit() {
    this.countries = [
      { name: 'India', code: 'IN' },
      { name: 'United States', code: 'USA' },
      { name: 'United Kingdom', code: 'UK' },
    ];
  }
  searchOrganizationName(event: AutoCompleteCompleteEvent) {
    const filtered: any[] = [];
    let query = event.query.toLowerCase();

    for (let i = 0; i < (this.organizationList as any[]).length; i++) {
      const practiceType = (this.organizationList as any[])[i];
      if (practiceType.value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(practiceType);
      }
    }
    // this.autoFilteredValue = this.organizationList.filter(organization =>
    //   organization?.value?.toLowerCase().startsWith(query)
    // );
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  }

  navigateToListPage(){
    this.router.navigateByUrl('/home/practice/list');
  }

  onDropdownChange() {
    this.showOtherPracticeTypeInput = this.selectedPracticeType?.code === 'Other';
  }


}
