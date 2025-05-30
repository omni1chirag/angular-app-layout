import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { PageHeaderDirective } from '@directive/page-header.directive';
import { NotificationService } from '@service/notification.service';
import { DoctorService } from '@service/doctor.service';
import { Subject, takeUntil } from 'rxjs';
import { AddressComponent } from '@component/common/address/address.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { MasterService } from '@service/master.service';
import { UtilityService } from '@service/utility.service';


interface LabelValue {
  label: string;
  value: any;
}

@Component({
  selector: 'app-doctor-add-edit',
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
    PageHeaderDirective,
    ReactiveFormsModule,
    AddressComponent,
    InputNumberModule,
    FileUploadComponent
  ],
  templateUrl: './doctor-add-edit.component.html',
  styleUrl: './doctor-add-edit.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService]
})
export class DoctorAddEditComponent implements OnInit, OnDestroy {

  isCallInitiated: boolean = false;
  mode: 'Add' | 'Edit' = 'Add';
  currentDate: Date | undefined;
  alphaNumeric: RegExp = new RegExp(/^[a-zA-Z0-9]+$/)
  numeric: RegExp = new RegExp(/^[0-9]+$/)
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/)
  documentTypes = ".jpeg,.png,.jpg";

  doctorForm: FormGroup;
  organizations: LabelValue[] = [];
  genders: LabelValue[] = [];
  titles: LabelValue[] = [];
  licenseIssuingAuthorities: LabelValue[] = [];
  paymentoptions: LabelValue[] = [];
  insuranceProviders: LabelValue[] = [];
  specialities: LabelValue[] = [];
  subSpecialities: LabelValue[] = [];
  medicalDegree: LabelValue[] = []
  clinics: LabelValue[] = []

  formSubscription$ = new Subject<void>();
  consultationModeOptions: LabelValue[] = [];

  get gender(): boolean {  
    return '0' == this.doctorForm?.get('gender').value + '';
  }

  get doctorId(): string {
    return this.doctorForm?.get('doctorId')?.value;
  }

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
  startTime = '08:00';
  endTime = '09:00';

  navigateToListPage() {
    this.router.navigateByUrl('/home/doctor/list');
  }

  constructor(private doctorService: DoctorService,
    private router: Router,
    private _fb: FormBuilder,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private masterService: MasterService,
    private utilityService: UtilityService,
  ) {

  }

  ngOnInit() {
    this.initializeMasterData();
    const { params } = this.activatedRoute.snapshot;
    const doctorId = params['id'];
    if (doctorId) {
      this.mode = 'Edit';
      this.getDoctor(doctorId);
    } else {
      this.initializeForm().then(() => {
        this.utilizeMasterData();
      });
    }
  }

  utilizeMasterData() {
    const addOrRemoveValidation = (gender) => {
      if (!gender) return;
      const genderFreeText = this.doctorForm.get('genderFreeText') as FormControl;
      if ('Others' == gender) {
        if (!genderFreeText.hasValidator(Validators.required)) {
          genderFreeText.addValidators(Validators.required);
        }
      } else {
        if (genderFreeText.hasValidator(Validators.required)) {
          genderFreeText.removeValidators(Validators.required);
        }
      }
    }

    const setClinics = (organizationId, firstLoad?) => {
      if (!organizationId) {
        this.clinics = [];
        this.doctorForm.get('clinics').setValue([]);
        return;
      }
      this.doctorService.getClinicLabels(organizationId).subscribe((resp: any) => {
        this.clinics = resp.data;
        if (!firstLoad) {
          this.doctorForm.get('clinics').setValue([]);
        }
      })
    }

    this.calculateAge();
    addOrRemoveValidation(this.doctorForm.get('gender').value);
    setClinics(this.doctorForm.get('organization').get('organizationId').value, true);

    this.doctorForm.get('gender')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    this.doctorForm.get('organization').get('organizationId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => setClinics(value));

  }

  ngOnDestroy() {
    this.formSubscription$.next();
    this.formSubscription$.complete();
  }

  getDoctor(doctorId) {
    this.doctorService.getDoctor(doctorId).subscribe({
      next: ({ data, message }) => {
        this.initializeForm(data).then(() => {
          this.utilizeMasterData();
        });
      },
      error: (error) => { this.cancel() }
    })
  }

  cancel() {
    this.router.navigateByUrl('home/doctor/list');
  }

  initializeMasterData() {
    this.currentDate = new Date();

    this.doctorService.getOrganizationLabels().subscribe((resp: any) => {
      this.organizations = resp.data;
    })

    this.masterService.getSpeciality().subscribe((resp: any) => {
      this.specialities = resp.data;
    })

    this.masterService.getSubSpeciality().subscribe((resp: any) => {
      this.subSpecialities = resp.data;
    })



    const params = ['TITLE', 'GENDER', 'LICENSE_ISSUING_AUTHORITY', 'PAYMENT_MODES', 'MEDICAL_DEGREES', 'INSURANCE_PROVIDERS', 'CONSULTATION_MODE'];
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'TITLE':
            this.titles = res.value
            break;
          case 'GENDER':
            this.genders = res.value;
            break;
          case 'LICENSE_ISSUING_AUTHORITY':
            this.licenseIssuingAuthorities = res.value;
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
            console.log('name not found', res.name);
            break;
        }

      })
    })
  }

  initializeForm(doctor?): Promise<void> {
    return new Promise((resolve) => {
      this.doctorForm = this._fb.group({
        doctorId: new FormControl<string | null>({ value: doctor?.doctorId, disabled: true }),
        organization: new FormGroup({
          organizationId: new FormControl<string | null>({ value: doctor?.organization?.organizationId, disabled: doctor?.doctorId ? true : false }, [Validators.required]),
        }),
        clinics: new FormControl<string[] | null>(doctor?.clinics, [Validators.required]),
        title: new FormControl<string | null>(doctor?.title, [Validators.required]),
        firstName: new FormControl<string | null>(doctor?.firstName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
        middleName: new FormControl<string | null>(doctor?.middleName, [Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
        lastName: new FormControl<string | null>(doctor?.lastName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
        gender: new FormControl<any | null>(doctor?.gender, [Validators.required]),
        genderFreeText: new FormControl<string | null>(doctor?.genderFreeText, [Validators.maxLength(64), Validators.pattern(this.alphaNumeric)]),
        dateOfBirth: new FormControl<Date | null>(doctor?.dateOfBirth ? doctor?.dateOfBirth : undefined, [Validators.required]),
        age: new FormControl<String | null>({ value: null, disabled: true }),
        licenseIssuingAuthority: new FormControl<string[] | null>(doctor?.licenseIssuingAuthority, [Validators.required]),
        licenseExpiryDate: new FormControl<Date | null>(doctor?.licenseExpiryDate ? doctor?.licenseExpiryDate : undefined, [Validators.required]),
        medicalRegistrationNumber: new FormControl<string | null>(doctor?.medicalRegistrationNumber, [Validators.required, Validators.maxLength(20), Validators.pattern(this.alphaNumeric)]),
        yearOfExperience: new FormControl<number | null>(doctor?.yearOfExperience, [Validators.required, Validators.maxLength(2)]),
        email: new FormControl<string | null>(doctor?.email, [Validators.required, Validators.email, Validators.maxLength(100)]),
        mobileNumber: new FormControl<string | null>(doctor?.mobileNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(this.numeric)]),
        profilePicture: new FormControl<String | null>(undefined),

        specialities: new FormControl<string[] | null>(doctor?.specialities, [Validators.required]),
        subSpecialization: new FormControl<string[] | null>(doctor?.subSpecialization),
        medicalDegree: new FormControl<string[] | null>(doctor?.medicalDegree),
        practicingSince: new FormControl<string | null>(doctor?.practicingSince),

        address1: new FormControl<string | null>(doctor?.address1, [Validators.required, Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
        address2: new FormControl<string | null>(doctor?.address2, [Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
        city: new FormControl<string | null>(doctor?.city, [Validators.required, Validators.maxLength(50)]),
        state: new FormControl<string | null>(doctor?.state, [Validators.required, Validators.maxLength(50)]),
        country: new FormControl<string | null>(doctor?.country, [Validators.required, Validators.maxLength(100)]),
        pincode: new FormControl<string | null>(doctor?.pincode, [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(this.numeric)]),
        status: new FormControl<String | null>((doctor?.status ?? 1) + '', [Validators.required]),

        consultationMode: new FormControl<string[] | null>(doctor?.consultationMode, [Validators.required]),
        consultationFee: new FormControl<number | null>(doctor?.consultationFee, [Validators.required]),
        availableDays: new FormControl<string[] | null>(doctor?.availableDays ?? this.days, [Validators.required]),
        availableTime: new FormGroup({
          startTime: new FormControl<string | null>(doctor?.availableTime?.startTime ?? this.startTime, [Validators.required]),
          endTime: new FormControl<string | null>(doctor?.availableTime?.endTime ?? this.endTime, [Validators.required]),
        }),
        paymentModes: new FormControl<string[] | null>(doctor?.paymentModes ?? ['Credit Card', 'Debit Card'], [Validators.required]),
        insuranceProviders: new FormControl<string[] | null>(doctor?.insuranceProviders),
      });
      resolve();
    });

  }

  calculateAge() {
    if (this.doctorForm.get('dateOfBirth').value) {
      const age = this.utilityService.convertDateToAgePSP(this.doctorForm.get('dateOfBirth').value);
      this.doctorForm.get('age').setValue(age);
      console.log('age', age);
    }
  }

  save() {
    if (this.doctorForm?.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.doctorForm);
      return;
    }
    const doctorId = this.doctorForm?.get('doctorId')?.value;
    const organizationId = this.doctorForm?.get('organization')?.get('organizationId')?.value;
    const user = this.doctorForm?.value;
    user['organization'] = { organizationId: organizationId }
    this.isCallInitiated = true;
    if (doctorId) {
      this.doctorService.updateDoctor(doctorId, user).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.notificationService.showSuccess(resp.message);
          this.cancel();
        },
        error: async (error: any) => {
          this.isCallInitiated = false
          this.notificationService.showError(error.error.message);
        },
        complete: () => { this.isCallInitiated = false }
      })
    } else {
      this.doctorService.saveDoctor(user).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.notificationService.showSuccess(resp.message);
          this.cancel();
        },
        error: async (error: any) => {
          this.isCallInitiated = false
          this.notificationService.showError(error.error.message);
        },
        complete: () => { this.isCallInitiated = false }
      })
    }
  }

}
