import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FluidModule } from 'primeng/fluid';
import { MultiSelectModule } from 'primeng/multiselect';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Organization, PaymentMode } from '@model/organization.model';
import { DropdownModule } from 'primeng/dropdown';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { DatePickerModule } from 'primeng/datepicker';
import { AddressComponent } from '@component/common/address/address.component';
import { OrganizationService } from '@service/organization.service';
import { SubscriptionPlan } from '@model/subscription.model';
import { SubscriptionService } from '@service/subscription.service';
import { NotificationService } from '@service/notification.service';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { UtilityService } from '@service/utility.service';

interface Service {
  name: string;
  code: string;
}

@Component({
  selector: 'app-organization-add-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    FluidModule,
    MultiSelectModule,
    SelectModule,
    FormsModule,
    CommonModule,
    FileUploadModule,
    ToastModule,
    DialogModule,
    CheckboxModule,
    ToolbarModule,
    DividerModule,
    PageHeaderDirective,
    SelectButtonModule,
    DropdownModule,
    MandatoryFieldLabelDirective,
    DatePickerModule,
    AddressComponent,
    DateMaskDirective,
    FileUploadComponent
  ],
  templateUrl: './organization-add-edit.component.html',
  styleUrl: './organization-add-edit.component.scss',
})
export class OrganizationAddEditComponent {

  mode: string = 'Add';

  otherOrganization: string = '';
  uploadedFiles: any[] = [];
  displayConfirmDialog: boolean = false;
  selectedOptions: any[] = [];
  isSubscriptionPlanSelected: boolean;

  subscriptionStatusOptions: any[] = [
    { name: 'Active', value: 'ACTIVE' },
    { name: 'Inactive', value: 'INACTIVE' },
    { name: 'Expired', value: 'EXPIRED' },
  ];

  organizationStatusOptions: any[] = [
    { name: 'Active', value: 'ACTIVE' },
    { name: 'Inactive', value: 'INACTIVE' },
  ];
  statusValue!: number;

  subscriptionPlanOptions: SubscriptionPlan[];
  selectedServices!: Service[];

  paymentoptions: PaymentMode[] = [
    { name: 'Cash', paymentModeId: '1', status: true, description: 'Cash payment' },
    { name: 'Credit Card', paymentModeId: '2', status: true, description: 'Credit Card payment' },
    { name: 'Debit Card', paymentModeId: '3', status: true, description: 'Debit Card payment' },
    { name: 'UPI', paymentModeId: '4', status: true, description: 'UPI payment' },
    { name: 'Net Banking', paymentModeId: '5', status: true, description: 'Net Banking payment' },
  ];
  countries: Service[] | undefined;
  selectedCountry: Service | undefined;
  organization: Organization = new Organization();
  organizationForm!: FormGroup;
  documentTypes = ".jpeg,.png,.jpg";
  alphaNumeric: RegExp = new RegExp(/^[a-zA-Z0-9]+$/)
  numeric: RegExp = new RegExp(/^[0-9]+$/)
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/)

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private subscriptionService: SubscriptionService,
    private activatedRoute: ActivatedRoute,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
    const organizationId = this.activatedRoute.snapshot.paramMap.get('id');
    if (organizationId) {
      this.mode = 'Edit';
      console.log('Organization ID:', organizationId);
      this.getOrganization(organizationId);
    } else {
      this.initializeForm();
    }

    this.getDefaultSubscriptionPlan();

  }

  get organizationId(): string {
    return this.organizationForm?.get('organizationId')?.value;
  }

  getDefaultSubscriptionPlan() {
    this.subscriptionService.getDefaultSubscriptions().subscribe((data: SubscriptionPlan[]) => {
      this.subscriptionPlanOptions = data;
    })
  }

  ngOnDestroy(): void {
  }

  getOrganization(organizationId) {
    this.organizationService.getOrganizationById(organizationId).subscribe({
      next: ({ data, message }) => {
        this.organization = data;
        this.initializeForm(this.organization);
      },
      error: (error) => {
        this.cancel();
        console.error('Error fetching organization:', error?.userMessage);
        this.notificationService.showSuccess(error?.userMessage || 'Unknown error occurred');
      }
    })
  }

  initializeForm(org?: Organization): void {
    this.organizationForm = this.fb.group({
      organizationId: new FormControl<string | null>(org?.organizationId ?? null),
      organizationName: new FormControl<string | null>(org?.organizationName, [Validators.required, Validators.maxLength(50)]),
      gstin: new FormControl<string | null>(org?.gstin, [Validators.required, Validators.minLength(15), Validators.maxLength(15)]),
      legalOrganizationName: new FormControl<string | null>(org?.legalOrganizationName, [Validators.required, Validators.maxLength(50)]),
      yearOfEstablishment: new FormControl<Date | null>(org?.yearOfEstablishment ? new Date(org.yearOfEstablishment) : null,
        [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]),
      organizationStatus: new FormControl<string | null>(org?.organizationStatus, [Validators.required]),
      address1: new FormControl<string | null>(org?.address1, [Validators.required, Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
      address2: new FormControl<string | null>(org?.address2, [Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
      city: new FormControl<string | null>(org?.city, [Validators.required, Validators.maxLength(50)]),
      state: new FormControl<string | null>(org?.state, [Validators.required, Validators.maxLength(50)]),
      country: new FormControl<string | null>(org?.country, [Validators.required, Validators.maxLength(100)]),
      pincode: new FormControl<string | null>(org?.pincode, [Validators.required, Validators.maxLength(6), Validators.pattern(this.numeric)]),
      email: new FormControl<string | null>(org?.email, [Validators.required, Validators.email, Validators.maxLength(100)]),
      mobileNumber: new FormControl<string | null>(org?.mobileNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      website: new FormControl<string | null>(org?.website, [Validators.maxLength(255)]),
      logo: new FormControl<string | null>(org?.logo),
      businessLicense: new FormControl<string | null>(org?.businessLicense),
      acceptedPaymentModes: new FormControl<string[] | null>((org?.acceptedPaymentModes || []).map((mode: any) => mode.name || mode), Validators.required),
      organizationSubscription: new FormGroup({
        organizationSubscriptionId: new FormControl<string | null>(org?.organizationSubscription?.organizationSubscriptionId ?? null),
        subscriptionPlanId: new FormControl<string | null>(org?.organizationSubscription?.subscriptionPlanId ?? null),
        startDate: new FormControl<Date | null>(
          org?.organizationSubscription?.startDate ? new Date(org.organizationSubscription.startDate + 'T00:00:00') : null,
          [Validators.required]
        ),
        expiryDate: new FormControl<Date | null>(
          org?.organizationSubscription?.expiryDate ? new Date(org.organizationSubscription.expiryDate + 'T00:00:00') : null,
          [Validators.required]
        ),
        paymentMethod: new FormControl<string | null>(org?.organizationSubscription?.paymentMethod ?? null, [Validators.required]),
        subscriptionStatus: new FormControl<string | null>(org?.organizationSubscription?.subscriptionStatus ?? null, Validators.required),
      }),
    });

    this.isSubscriptionPlanSelected = org?.organizationSubscription?.subscriptionPlanId != null;
  }

  cancel() {
    this.router.navigateByUrl('/home/users');
  }

  onSubscriptionPlanChange(event: SelectChangeEvent) {
    event.value == null ? this.isSubscriptionPlanSelected = false : this.isSubscriptionPlanSelected = true;
  }

  onCancel() {
    this.router.navigateByUrl('/home/organization/list');
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.notificationService.showSuccess('File Uploaded');
  }

  navigateToListPage() {
    this.router.navigateByUrl('/home/organization/list');
  }

  submitOrganizationForm(id: string | null) {

    if (this.organizationForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.organizationForm);
      const totalErrors = this.utilityService.getFormValidationErrors(this.organizationForm);
      this.notificationService.showWarning('Form is invalid. total errors: ' + totalErrors);
      return;
    }

    const date = this.organizationForm.value.yearOfEstablishment;
    const fixedDate = date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) : null;
    this.organizationForm.patchValue({ yearOfEstablishment: fixedDate });

    const startDate = this.organizationForm.value.organizationSubscription.startDate;
    const fixedStartDate = startDate ? new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) : null;
    this.organizationForm.patchValue({ organizationSubscription: { ...this.organizationForm.value.organizationSubscription, startDate: fixedStartDate } });

    const expiryDate = this.organizationForm.value.organizationSubscription.expiryDate;
    const fixedExpiryDate = expiryDate ? new Date(Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate())) : null;
    this.organizationForm.patchValue({ organizationSubscription: { ...this.organizationForm.value.organizationSubscription, expiryDate: fixedExpiryDate } });

    this.organization = this.organizationForm.value;
    id ? this.updateOrganization(id) : this.createOrganization();
  }

  createOrganization() {
    this.organizationService.createOrganization(this.organization).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Organization created successfully');
        this.organizationForm.reset();
        this.navigateToListPage();
      },
      error: (error) => {
        console.error('Error creating organization:', error?.userMessage);
        this.notificationService.showError(error?.userMessage || 'Unknown error occurred');
      }
    });
  }

  updateOrganization(id: string) {
    this.organizationService.updateOrganization(id, this.organization).subscribe({
      next: (response) => {
        console.log('Organization updated successfully:', response);
        this.notificationService.showSuccess('Organization updated successfully');
        this.organizationForm.reset();
        this.navigateToListPage();
      },
      error: (error) => {
        console.error('Error updating organization:', error?.userMessage);
        this.notificationService.showError(error?.userMessage || 'Unknown error occurred');
      }
    });
  }

  

  
}