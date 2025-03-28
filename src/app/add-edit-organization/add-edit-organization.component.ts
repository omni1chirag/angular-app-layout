import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FluidModule } from 'primeng/fluid';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { Router } from '@angular/router';
interface Service {
  name: string;
  code: string;
}

@Component({
  selector: 'app-add-edit-organization',
  standalone: true,
  imports: [CardModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    FluidModule,
    MultiSelectModule,
    SelectModule,
    FormsModule,
    CommonModule,
    MultiSelectModule,
    FileUploadModule,
    ToastModule,
    DialogModule,
  CheckboxModule,
  ToolbarModule,
  DividerModule,
  PageHeaderDirective,
],
  templateUrl: './add-edit-organization.component.html',
  styleUrl: './add-edit-organization.component.scss',
  providers: [MessageService]
})
export class AddEditOrganizationComponent {
  constructor(private messageService: MessageService,
              private router: Router
  ) {}
  dropdownItem: any = null;
  showOtherInput: boolean = false;
  otherOrganization: string = '';
  Paymentopt: any = null;
  subscriptionPlan: any = null;
  uploadedFiles: any[] = [];
  displayConfirmDialog: boolean = false;
  selectedOptions: any[] = [];
  dropdownItems = [
    { name: 'Hospital', code: 'Hospital' },
    { name: 'Clinic', code: 'Clinic' },
    { name: 'Diagnostic Center', code: 'Diagnostic Center' },
    { name: 'Pharmacy', code: 'Pharmacy' },
    { name: 'Medical Equipment', code: 'Medical Equipment' },
    { name: 'Other', code: 'Other' }
  ];

  Services: Service[] = [
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

  subscriptionPlanoptions = [
    { name: 'plan1', code: 'plan1' },
    { name: 'plan2', code: 'plan2' },
    { name: 'plan3', code: 'plan3' },
    { name: 'plan4', code: 'plan4' },];

    selectedServices!: Service[];

  paymentoptions = [
    { name: 'Cash', code: 'Cash' },
    { name: 'Credit Card', code: 'Credit Card' },
    { name: 'Debit Card', code: 'Debit Card' },
    { name: 'UPI', code: 'UPI' }
  ];
  onDropdownChange() {
    this.showOtherInput = this.dropdownItem?.code === 'Other';
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  }

  navigateToListPage(){
    this.router.navigateByUrl('/home/oraganization-list');
  }
}
