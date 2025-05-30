import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import { ToolbarModule } from 'primeng/toolbar';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { NotificationService } from '@service/notification.service';
import { AddressComponent } from '@component/common/address/address.component';
import { MasterService } from '@service/master.service';
import { DoctorService } from '@service/doctor.service';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { UtilityService } from '@service/utility.service';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';

interface LabelValue {
  label: string;
  value: any;
}
@Component({
  selector: 'app-doctor-registration',
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
    DividerModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    MandatoryFieldLabelDirective,
    AddressComponent,
    DateMaskDirective,
    FileUploadComponent,
    PhoneNumberMaskDirective],
  providers: [MessageService],

  templateUrl: './doctor-registration.component.html',
})
export class DoctorRegistrationComponent implements OnInit {
  // providerreg: ProviderRegistration | null = null;
  alphaNumeric: RegExp = /^[a-zA-Z0-9]*$/;
  gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  numeric: RegExp = /^[0-9]*$/;
  isBrowser: boolean;
  doctorForm: FormGroup;
  currentDate: Date | undefined;
  doctor: DoctorModel = new DoctorModel({});
  titles: LabelValue[] = [];
  genders: LabelValue[] = [];
  LicenceList: LabelValue[] = [];
  specialities: LabelValue[] = [];
  subSpecialities: LabelValue[] = [];
  medicalDegree: LabelValue[] = [];
  paymentoptions: LabelValue[] = [];
  licenseIssuingAuthorities: LabelValue[] = [];
  insuranceProviders: LabelValue[] = [];
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  daysoptions = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' }
  ];
  uploadedFiles: any;
  communicationModes: LabelValue[] = [];
  isCallInitiated: boolean = false;
  documentTypes = ".jpeg,.png,.jpg";
  clinicId: string = null;
  consultationModeOptions: LabelValue[] = [];

  get gender(): boolean {
    return 'Others' == this.doctorForm?.get('gender').value;
  }

  get maxYearOfExperience(): string {
    return this.doctorForm?.get('age')?.value ?? 100;
  }

  get doctorId(): string {
    return this.doctorForm?.get('doctorId')?.value;
  }

  // get clinicId(): string {
  //   return this.clinicForm.get('clinicId')?.value;
  // }
  constructor(
    private _fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private doctorService: DoctorService,
    private notificationService: NotificationService,
    private masterService: MasterService,
    private utilityService: UtilityService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeMasterData();
  }

  initializeForm(doctor?: Partial<DoctorModel>): void {
    this.doctorForm = this._fb.group({

      title: new FormControl(doctor?.title ?? null, [Validators.required]),
      firstName: new FormControl(doctor?.firstName ?? null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.alphaNumeric)
      ]),
      middleName: new FormControl(doctor?.middleName ?? null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.alphaNumeric)
      ]),
      lastName: new FormControl(doctor?.lastName ?? null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.alphaNumeric)
      ]),
      dateOfBirth: new FormControl(doctor?.dateOfBirth ? new Date(doctor.dateOfBirth) : null, [Validators.required]),
      age: new FormControl<number | null>({ value: null, disabled: true }),
      gender: new FormControl(doctor?.gender ?? null, [Validators.required]),
      genderFreeText: new FormControl(doctor?.genderFreeText ?? null, [
        Validators.maxLength(64),
        Validators.pattern(this.alphaNumeric)
      ]),
      email: new FormControl(doctor?.email ?? null, [Validators.required]),
      mobileNumber: new FormControl(doctor?.mobileNumber ?? null, [
        Validators.required,
        Validators.maxLength(10)
      ]),
      medicalRegNumber: new FormControl(doctor?.medicalRegNumber ?? null, [
        Validators.required,
        Validators.maxLength(20)
      ]),
      licenceIssuingAuthority: new FormControl(doctor?.licenceIssuingAuthority ?? null, [Validators.required]),
      licenseExpiryDate: new FormControl(doctor?.licenseExpiryDate ? new Date(doctor.licenseExpiryDate) : null),
      yearsOfExp: new FormControl(doctor?.yearsOfExp ?? null, [Validators.required]),
      profilePicture: new FormControl(doctor?.profilePicture ?? null),

      // Specialization
      speciality: new FormControl(doctor?.speciality ?? null, [Validators.required]),
      subSpeciality: new FormControl(doctor?.subSpeciality ?? null, [Validators.required]),
      medicalDegree: new FormControl(doctor?.medicalDegree ?? null, [Validators.required]),
      practicingSince: new FormControl(doctor?.practicingSince ? new Date(doctor.practicingSince) : null),

      // Practice Details
      gstin: new FormControl(doctor?.gstin, [Validators.required, Validators.pattern(this.gstinRegex)]),
      legalBusinessName: new FormControl(doctor?.legalBusinessName, [Validators.required, Validators.maxLength(50)]),
      clinicName: new FormControl(doctor?.clinicName ?? null, [Validators.required]),
      address1: new FormControl(doctor?.address1 ?? null, [Validators.required]),
      address2: new FormControl(doctor?.address2 ?? null),
      pincode: new FormControl(doctor?.pincode ?? null, [
        Validators.required,
        Validators.pattern('^[0-9]{6}$')
      ]),
      city: new FormControl(doctor?.city ?? null, [Validators.required]),
      state: new FormControl(doctor?.state ?? null, [Validators.required]),
      country: new FormControl(doctor?.country ?? null, [Validators.required]),
      clinicLogo: new FormControl(doctor?.clinicLogo ?? null),
      clinicLicense: new FormControl(doctor?.clinicLicense ?? null),

      // Consultation
      consultationMode: this._fb.group({
        inPerson: new FormControl(doctor?.consultationMode?.inPerson ?? false),
        virtual: new FormControl(doctor?.consultationMode?.virtual ?? false),
        both: new FormControl(doctor?.consultationMode?.both ?? false)
      }),
      days: new FormControl(doctor?.availableDays ??  this.days, [Validators.required]),
      startTime: new FormControl(doctor?.startTime ?? null, [Validators.required]),
      endTime: new FormControl(doctor?.endTime ?? null, [Validators.required]),
      consultationFee: new FormControl(doctor?.consultationFee ?? null, [Validators.required, Validators.min(0)]),
      paymentMode: new FormControl(doctor?.paymentMode ?? [], [Validators.required]),
      insuranceProviders: new FormControl(doctor?.insuranceProviders ?? []),

      // Declarations
      tc: new FormControl(doctor?.tc ?? false, [Validators.requiredTrue]),
      ac: new FormControl(doctor?.ac ?? false, [Validators.requiredTrue])
    });
  }

  initializeMasterData(): void {
    this.currentDate = new Date();
    this.masterService.getSpeciality().subscribe((resp: any) => {
      this.specialities = resp.data;
    })
    this.masterService.getSubSpeciality().subscribe((resp: any) => {
      this.subSpecialities = resp.data;
    })
    const params = ['TITLE', 'GENDER', 'LICENSE_ISSUING_AUTHORITY', 'PAYMENT_MODES', 'MEDICAL_DEGREES', 'INSURANCE_PROVIDERS'];
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'TITLE':
            this.titles = res.value;
            break;
          case 'GENDER':
            this.genders = res.value;
            break;
          case 'LICENSE_ISSUING_AUTHORITY':
            this.LicenceList = res.value;
            break;
          case 'PAYMENT_MODES':
            this.paymentoptions = res.value;
            break;
          case 'MEDICAL_DEGREES':
            this.medicalDegree = res.value;
            break;
          case 'INSURANCE_PROVIDERS':
            this.insuranceProviders = res.value;
            break;
          case 'CONSULTATION_MODE':
            this.consultationModeOptions = res.value;
            break
          default:
            console.log('Unknown master data:', res.name);
        }
      });
    });
  }

  calculateAge(): void {
    if (this.doctorForm.get('dateOfBirth').value) {
      const age = this.utilityService.convertDateToAgePSP(this.doctorForm.get('dateOfBirth').value);
      this.doctorForm.get('age').setValue(age);
      console.log('age', age);
    }
  }

  onUpload(event: any): void {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: `${event.files.length} files uploaded successfully.`
    });
  }

  save(): void {
    if (this.doctorForm.invalid) {
      Object.keys(this.doctorForm.controls).forEach(field => {
        const control = this.doctorForm.get(field);
        control?.markAsDirty();
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
      return;
    }

    const formData = this.doctorForm.value;
    const doctorData = new DoctorModel({
      ...formData,
      // email: "root@yomail.com",
      // mobileNumber: "9898123979"
    });

    this.isCallInitiated = true;
    this.doctorService.saveRegistrationform(doctorData).subscribe({
      next: (resp: any) => {
        this.notificationService.showSuccess(resp.message);
        this.isCallInitiated = false;
      },
      error: () => {
        this.isCallInitiated = false;
      },
      complete: () => {
        this.isCallInitiated = false;
      }
    });
  }

  navigateToSubscriptionScreen(){
    this.router.navigate(['/subscription']);
  }
}


export class DoctorModel {
  title: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  gender: string;
  genderFreeText?: string;
  dateOfBirth: Date;
  age?: number;
  medicalRegNumber: string;
  licenceIssuingAuthority: string;
  licenseExpiryDate?: Date;
  yearsOfExp: number;
  profilePicture?: string;
  speciality: string;
  subSpeciality: string;
  medicalDegree: string;
  practicingSince?: Date;
  gstin: string;
  legalBusinessName: string;
  clinicName: string;
  address1: string;
  address2?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  clinicLogo?: string;
  clinicLicense?: string;
  consultationMode: any;
  availableDays: string[];
  startTime: string;
  endTime: string;
  consultationFee: number;
  paymentMode: string[];
  insuranceProviders: string[];
  tc: boolean;
  ac: boolean;
  email: string;
  mobileNumber: string;

  constructor(data: Partial<DoctorModel>) {
    Object.assign(this, data);
  }
}
