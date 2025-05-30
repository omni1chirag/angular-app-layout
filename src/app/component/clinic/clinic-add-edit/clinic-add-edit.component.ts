import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
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
import { PageHeaderDirective } from '@directive/page-header.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { AddressComponent } from "@component/common/address/address.component";
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NotificationService } from '@service/notification.service';
import { Organization } from '@model/organization.model';
import { ClinicService } from '@service/clinic.service';
import { Clinic, PaymentMode } from '@model/clinic.model';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { MasterService } from '@service/master.service';

interface Country {
  name: string;
  code: string;
}
interface LabelValue {
  label: string;
  value: any;
}
@Component({
  selector: 'app-clinic-add-edit',
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
    MultiSelectModule,
    AddressComponent,
    MandatoryFieldLabelDirective,
    SelectButtonModule,
    FileUploadComponent
],
  templateUrl: './clinic-add-edit.component.html',
  providers: [MessageService]
})
export class ClinicAddEditComponent {
  clinic: Clinic = new Clinic();
  mode: 'Add' | 'Edit' = 'Add';
  clinicForm: FormGroup;
  selectedCountry: Country | undefined;
  isCallInitiated: boolean = false;
  specialities: LabelValue[] = [];
  documentTypes = ".jpeg,.png,.jpg";
  paymentoptions: PaymentMode[] = [
    { name: 'Cash', paymentModeId: '1', status: true, description: 'Cash payment' },
    { name: 'Credit Card', paymentModeId: '2', status: true, description: 'Credit Card payment' },
    { name: 'Debit Card', paymentModeId: '3', status: true, description: 'Debit Card payment' },
    { name: 'UPI', paymentModeId: '4', status: true, description: 'UPI payment' },
    { name: 'Net Banking', paymentModeId: '5', status: true, description: 'Net Banking payment' },
  ];
  organizations: LabelValue[] = [];
  uploadedFiles: any;
  statuses: LabelValue[] = [];

  get clinicId(): string {
    return this.clinicForm.get('clinicId')?.value;
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private clinicService: ClinicService ,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private masterService: MasterService
  ) {}

  ngOnInit() {
    this.initializeMasterData();
    const { params } = this.activatedRoute.snapshot;
    const clinicId = params['id'];
    const organizationId = this.activatedRoute.snapshot.queryParamMap.get('organizationId');
    if(clinicId) {
      this.mode = 'Edit'; 
      this.getClinicById(clinicId);
    }
    else{
      if(organizationId) {
        this.clinic.organization = new Organization();
        this.clinic.organization.organizationId = organizationId;
      }
      this.createForm(this.clinic);
    }
  }

  getClinicById(clinicId: string) {
    this.clinicService.getClinicById(clinicId).subscribe({
      next: ({ data }) => {
        this.createForm(data);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load clinic data. Try again.',
        });
        console.error('Get clinic by ID failed:', err);
      }
    });
  }

  createForm(clinic: Clinic = new Clinic()): void {
    this.clinicForm = this.fb.group({
      clinicId: new FormControl<string | null>({ value: clinic?.clinicId, disabled: true }),
      organization: this.fb.group({
        organizationId: new FormControl<string | null>(clinic?.organization?.organizationId, [Validators.required])
      }),
      clinicName: new FormControl<string | null>(clinic?.clinicName ?? null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\s]+$/)
      ]),
      clinicRegistrationId: new FormControl<string | null>(clinic?.clinicRegistrationId ?? null, [
        Validators.required, Validators.minLength(20),
        Validators.maxLength(20)        
      ]),
      gstin: new FormControl<string | null>(clinic?.gstin ?? null, [
        Validators.required, Validators.minLength(15),
        Validators.maxLength(15),
      ]),
      yearOfEstablishment: new FormControl<Date | null>(clinic?.yearOfEstablishment ? new Date(clinic.yearOfEstablishment) : null,
        [Validators.min(1900), Validators.max(new Date().getFullYear())]),
      speciality: new FormControl<string | null>(clinic?.speciality ?? null, [Validators.required]),
      status: new FormControl<string | null>(clinic?.status?.toString(), [Validators.required]),
      clinicLogo: new FormControl<String | null>(undefined),
      address1: new FormControl<string | null>(clinic?.address1 ?? null, [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(/^[a-zA-Z0-9\s,.\-\/()]+$/)
      ]),
      address2: new FormControl<string | null>(clinic?.address2 ?? null),
      city: new FormControl<string | null>(clinic?.city ?? null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]),
      state: new FormControl<string | null>(clinic?.state ?? null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]),
      country: new FormControl<string | null>(clinic?.country ?? null, [Validators.required]),
      pincode: new FormControl<string | null>(clinic?.pincode ?? null, [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]),
      mobileNumber: new FormControl<string | null>(clinic?.mobileNumber ?? null, [
        Validators.required,
        Validators.pattern(/^\d{10}$/)
      ]),
      email: new FormControl<string | null>(clinic?.email ?? null, [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]),
      // acceptedPaymentModes:  [prac?.acceptedPaymentModes || [], Validators.required],
      acceptedPaymentModes: [ clinic?.acceptedPaymentModes ? clinic?.acceptedPaymentModes
        : this.paymentoptions.map((mode: any) => mode.name || mode) ,
        Validators.required
      ],          
    });
  }  

  save() {
    if (this.clinicForm.invalid) {
      Object.keys(this.clinicForm.controls).forEach(field => {
        const control = this.clinicForm.get(field);
        control?.markAsDirty();
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
      return;
    }

    const clinicId = this.clinicForm.get('clinicId')?.value;
    const formData = this.clinicForm.value;
    const clinicData: Clinic = {
      ...this.clinic,
      ...formData,
    };

    this.isCallInitiated = true;

    if (clinicId) {
      this.clinicService.updateClinic(clinicId, clinicData).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false;
          this.notificationService.showSuccess(resp.message);
          this.navigateToListPage();
        },
        error: async (error: any) => {
          this.isCallInitiated = false
        },
        complete: () => { this.isCallInitiated = false }
      });
    } else {
      this.clinicService.createClinic(clinicData).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.notificationService.showSuccess(resp.message);
          this.navigateToListPage();
        },
        error: async (error: any) => {
          this.isCallInitiated = false
        },
        complete: () => { this.isCallInitiated = false }
      })
    }
  }  

  initializeMasterData(){
    this.masterService.getSpeciality().subscribe((resp: any) => {
    this.specialities = resp.data;
    })
    this.clinicService.getOrganizationLabels().subscribe((resp: any) => {
      this.organizations = resp.data;
    })
    const params = ['STATUS']
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'STATUS':
            this.statuses = res.value
            break;
          default:
            console.log('name not found', res.name);
            break;
        }
      })
    })
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: `${event.files.length} files uploaded successfully.`,
    });
  }
  navigateToListPage() {
    this.router.navigateByUrl('/home/clinic/list');
  }

}
