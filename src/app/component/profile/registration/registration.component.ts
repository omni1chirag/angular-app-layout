import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AddressComponent } from '@component/common/address/address.component';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { TermsAndConditionComponent } from '@component/common/terms-and-condition/terms-and-condition.component';
import { APP_ROUTES } from '@constants/app.constants';
import { REGEX } from '@constants/regex.constant';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';
import { ApiResponse } from '@interface/api-response.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import {
  EmergencyContact,
  Patient,
  PatientProfileSelectionDTO,
} from '@interface/patient-profile.interface';
import { PatientUserProfile } from '@interface/user-profile.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { KeycloakService } from '@service/keycloak.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { UserService } from '@service/user.service';
import { UtilityService } from '@service/utility.service';
import { CustomValidators } from '@validator/custom.validator';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-registration',
  imports: [
    InputNumberModule,
    DividerModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    SelectButtonModule,
    ToolbarModule,
    TranslateModule,
    MandatoryFieldLabelDirective,
    PhoneNumberMaskDirective,
    ConfirmDialogModule,
    DateMaskDirective,
    MultiSelectModule,
    InputGroupModule,
    TableModule,
    DatePickerModule,
    InputMaskModule,
    SelectButtonModule,
    InputGroupAddonModule,
    FileUploadComponent,
    AddressComponent,
    CheckboxModule,
    DialogModule,
    InputOtpModule,
    TermsAndConditionComponent,
    PhoneNumberMaskDirective,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './registration.component.html',
  providers: [ConfirmationService],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly platformService = inject(PlatformService);
  private readonly patientService = inject(PatientService);
  private readonly userService = inject(UserService);
  private readonly masterService = inject(MasterService);
  private readonly notificationService = inject(NotificationService);
  private readonly utilityService = inject(UtilityService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);

  numeric: RegExp = REGEX.NUMERIC;
  alphaNumeric: RegExp = REGEX.ALPHA_NUMERIC;
  addressRegex : RegExp = REGEX.ADDRESS_LINE_REGEX;
  alphaNumericSpace: RegExp = REGEX.ALPHA_NUMERIC_SPACE;
  middleNamePattern: RegExp =  REGEX.MIDDLE_NAME_REGEX;

  @ViewChild('termscomponent') termscomponent: TermsAndConditionComponent;

  documentTypes = '.jpeg,.png,.jpg';
  isBrowser = false;
  profileForm: FormGroup;
  currentDate: Date | undefined;
  readonly minDateOfBirth = new Date('1900-01-01')
  isCallInitiated = false;
  familyMemberMobileNumber: string;
  profileFetchOTP: string;
  isOTPSent = false;
  countdownTime = 60;
  subscription!: Subscription;
  selectedProfile: PatientProfileSelectionDTO;
  private readonly destroy$ = new Subject<void>();

  formattedTime = signal<string>('');
  isProfileSelectionVisible = signal<boolean>(false);

  genders: LabelValue<number>[] = [];
  titles: LabelValue<string>[] = [];
  languages: LabelValue<string>[] = [];
  maritalStatuses: LabelValue<number>[] = [];
  patientRelationShips: LabelValue<number>[] = [];
  userRelationShips: LabelValue<number>[] = [];
  bloodGroups: LabelValue<string>[] = [];
  communicationModes: LabelValue<number>[] = [];
  profileSuggestions: PatientProfileSelectionDTO[] = [];
  yesNoOptions: LabelValue<boolean>[] = [];

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  get patientId(): string {
    return this.profileForm?.get('patientId').value;
  }

  get getEmergencyContacts(): FormArray {
    const emergencyContacts = this.profileForm.get(
      'emergencyContacts'
    ) as FormArray;
    return emergencyContacts;
  }

  get gender(): boolean {
    return 0 == this.profileForm?.get('gender').value;
  }

  get maritalStatus(): boolean {
    return 0 == this.profileForm?.get('maritalStatus').value;
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    const userId = this.localStorageService.getloggedinUserId();
    this.getProfileData(userId);
    this.initializeMasterData();
  }

  getProfileData(userId: string): void {
    if (!userId) {
      this.cancel();
      return;
    }
    const apiSub = this.userService.getUser<PatientUserProfile>(userId);

    apiSub.subscribe({
      next: (data) => {
        const initialData: PatientUserProfile = {
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNumber: data.mobileNumber,
          alternateMobileNumber: data.alternateMobileNumber,
          email: data.email,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          preferredLanguages: data.preferredLanguages,
          communicationModes: data.communicationModes,
        };
        this.initializeForm(initialData);
      },
      error: () => {
        this.cancel();
      },
    });
  }

  cancel(): void {
    this.keycloakService.logout(APP_ROUTES.APP);
  }

  initializeForm(data?: PatientUserProfile): void {
    this.profileForm = this._fb.group({
      userId: new FormControl<string | null>(data?.userId, [
        Validators.required,
      ]),
      patientId: new FormControl<string | null>(undefined),
      title: new FormControl<string | null>(undefined),
      firstName: new FormControl<string | null>(data?.firstName, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.alphaNumeric),
      ]),
      middleName: new FormControl<string | null>(undefined, [
        Validators.maxLength(50),
        Validators.pattern(this.middleNamePattern),
      ]),
      lastName: new FormControl<string | null>(data?.lastName, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.alphaNumeric),
      ]),
      gender: new FormControl<number | null>(undefined, [Validators.required]),
      genderFreeText: new FormControl<string | null>(undefined, [
        Validators.maxLength(64),
        Validators.pattern(this.alphaNumeric),
      ]),
      dateOfBirth: new FormControl<Date | null>(undefined, [
        Validators.required,
      ]),
      age: new FormControl<string | null>({ value: null, disabled: true }),
      maritalStatus: new FormControl<string | null>(undefined),
      maritalStatusFreeText: new FormControl<string | null>(undefined, [
        Validators.maxLength(64),
        Validators.pattern(this.alphaNumeric),
      ]),

      aadharNumber: new FormControl<string | null>(undefined, [
        Validators.maxLength(12),
        Validators.pattern(this.numeric),
      ]),
      abhaId: new FormControl<string | null>(undefined, [
        Validators.maxLength(14),
        Validators.pattern(this.alphaNumeric),
      ]),
      preferredLanguages: new FormControl<string[] | null>(
        ['en-US'],
        []
      ),

      address1: new FormControl<string | null>(data?.address1, [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(this.addressRegex),
      ]),
      address2: new FormControl<string | null>(data?.address2, [
        Validators.maxLength(255),
        Validators.pattern(this.addressRegex),
      ]),
      city: new FormControl<string | null>(data?.city, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      state: new FormControl<string | null>(data?.state, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      country: new FormControl<string | null>(data?.country, [
        Validators.required,
        Validators.maxLength(100),
      ]),
      pincode: new FormControl<string | null>(data?.pincode, [
        Validators.required,
        Validators.maxLength(6),
        Validators.pattern(this.numeric),
      ]),
      email: new FormControl<string | null>(data?.email, [
        Validators.email,
        Validators.maxLength(100),
      ]),
      mobileNumber: new FormControl<string | null>(
        { value: data?.mobileNumber, disabled: true },
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ]
      ),
      alternateMobileNumber: new FormControl<string | null>(
        data?.alternateMobileNumber,
        [Validators.minLength(10), Validators.maxLength(10)]
      ),

      bloodGroup: new FormControl<string | null>(undefined),
      profilePicture: new FormControl<string | null>(undefined),
      emergencyContacts: new FormArray([], [Validators.required]),
      communicationModes: new FormControl<number[] | null>([1, 2], []),

      joinCurrentUserAs: new FormControl<number | undefined>(1),
      joinCurrentUser: new FormControl<boolean>(true),
      stillFamilyMember: new FormControl<boolean>(false),
    });

    this.addEmergencyContacts();
  }

  addEmergencyContacts(
    emergencyContact?: EmergencyContact,
    fromHtml = false
  ): void {
    if (this.getEmergencyContacts.length >= 10) {
      this.notificationService.showWarning(
        'Maximum 10 emergency contact details can be added'
      );
      return;
    }
    if (fromHtml) {
      if (this.getEmergencyContacts.invalid) {
        this.utilityService.markControlsAsDirtyAndTouched(
          this.getEmergencyContacts
        );
        return;
      }
    }
    const contactDetailForm = this._fb.group({
      id: new FormControl<number | null>({
        value: new Date().getTime(),
        disabled: true,
      }),
      contactId: new FormControl<string | null>(emergencyContact?.contactId),
      contactName: new FormControl<string | null>(
        emergencyContact?.contactName,
        [Validators.maxLength(50), Validators.pattern(this.alphaNumericSpace) ]
      ),
      contactNumber: new FormControl<string | null>(
        emergencyContact?.contactNumber,
        [CustomValidators.mobileNumber]
      ),
      contactRelation: new FormControl<number | null>(
        emergencyContact?.contactRelation
      ),
      orderPosition: new FormControl<number | null>(
        this.getEmergencyContacts.length
      ),
    });
    const contactName = contactDetailForm.get('contactName') as FormControl;
    const contactNumber = contactDetailForm.get('contactNumber') as FormControl;
    const contactRelation = contactDetailForm.get('contactRelation') as FormControl;
    contactName.addValidators(this.conditionalRequiredValidator(() => contactDetailForm));
    contactNumber.addValidators(this.conditionalRequiredValidator(() => contactDetailForm));
    contactRelation.addValidators(this.conditionalRequiredValidator(() => contactDetailForm));
    contactDetailForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      contactName.updateValueAndValidity({ emitEvent: false });
      contactNumber.updateValueAndValidity({ emitEvent: false });
      contactRelation.updateValueAndValidity({ emitEvent: false });
    });

    this.getEmergencyContacts.push(contactDetailForm);
    this.updateOrderPositions();
    this.calculateAge();
  }

  conditionalRequiredValidator(getGroup: () => FormGroup) {
    return (control: AbstractControl): { required: true } => {
      const group = getGroup();
      const contactName = group.get('contactName') as FormControl;
      const contactNumber = group.get('contactNumber') as FormControl;
      const contactRelation = group.get('contactRelation') as FormControl;

      const anyFilled = !!contactName?.value || !!contactNumber?.value || !!contactRelation?.value;

      return anyFilled && !control.value ? { required: true } : null;
    };
  }

  updateOrderPositions(): void {
    this.getEmergencyContacts.controls.forEach((control, index) => {
      control.get('orderPosition').setValue(index + 1);
    });
  }

  removeEmergencyContact(index: number): void {
    if (index >= 0 && index < this.getEmergencyContacts.length) {
      const emergencyContacts = this.profileForm.get(
        'emergencyContacts'
      ) as FormArray;
      emergencyContacts.removeAt(index);
      this.updateOrderPositions();
    }
  }

  onRowReorder(): void {
    this.updateOrderPositions();
  }

  calculateAge(): void {
    if (this.profileForm.get('dateOfBirth').value) {
      const birthDate = new Date(this.profileForm.get('dateOfBirth').value);
      const fixedDate = new Date(
        Date.UTC(
          birthDate.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        )
      );
      this.profileForm.get('dateOfBirth').patchValue(fixedDate);

      const age = this.dateTimeUtilityService.convertDateToAgePSP(fixedDate);
      this.profileForm.get('age').setValue(age);
    }
  }

  initializeMasterData(): void {
    this.currentDate = new Date();

    const params = [
      'TITLE',
      'YES_NO_BOOLEAN',
      'GENDER',
      'LANGUAGE',
      'MARITAL_STATUS',
      'PATIENT_RELATION_SHIPS',
      'BLOOD_GROUP',
      'COMMUNICATION_MODE',
    ];
    this.masterService
      .getCommonMasterData<CommonMaster<unknown>[]>(params)
      .subscribe((data) => {
        data.forEach((res) => {
          switch (res.name) {
            case 'TITLE':
              this.titles = res.value as LabelValue<string>[];
              break;
            case 'YES_NO_BOOLEAN':
              this.yesNoOptions = res.value as LabelValue<boolean>[];
              break;
            case 'GENDER':
              this.genders = res.value as LabelValue<number>[];
              break;
            case 'LANGUAGE':
              this.languages = res.value as LabelValue<string>[];
              break;
            case 'MARITAL_STATUS':
              this.maritalStatuses = res.value as LabelValue<number>[];
              break;
            case 'PATIENT_RELATION_SHIPS':
              this.patientRelationShips = res.value as LabelValue<number>[];
              this.userRelationShips = (
                (res.value as LabelValue<number>[]) || []
              ).filter((e) => e.value != 1);
              break;
            case 'BLOOD_GROUP':
              this.bloodGroups = res.value as LabelValue<string>[];
              break;
            case 'COMMUNICATION_MODE':
              this.communicationModes = res.value as LabelValue<number>[];
              break;
            default:
              console.error('name not found', res.name);
              break;
          }
        });
      });
  }

  validateEmergencyContact(): Promise<boolean> {
    return new Promise((resolve) => {
      const contactNumbers = new Set();
      this.getEmergencyContacts.value.forEach((control) => {
        const contactNumber = control['contactNumber'] + '';
        if (contactNumbers.has(contactNumber)) {
          resolve(false);
        }
        contactNumbers.add(contactNumber);
      });
      resolve(true);
    });
  }

  async save(): Promise<void> {
    if (this.profileForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.profileForm);
      return;
    }
    const isEmergencyContactValid = await this.validateEmergencyContact();
    if (!isEmergencyContactValid) {
      this.notificationService.showWarning(
        'Duplicate emergency contact number found'
      );
      return;
    }

    const termsData = this.termscomponent.getSelectedTerms();

    const patientId = this.profileForm.get('patientId').value;

    const patient = { ...this.profileForm.value };
    patient['emergencyContacts'] =
     this.getEmergencyContacts.value.filter(e=> !!e['contactNumber'] );
    patient['mobileNumber'] = this.profileForm.get('mobileNumber').value;
    patient['email'] = this.profileForm.get('email').value;
    patient['userId'] = this.profileForm.get('userId').value;
    patient['termsAndConditions'] = termsData;
    patient['sourceType'] = 'PATIENT_APP';
    delete patient['terms'];

    const apiSub = patientId
      ? this.patientService.updatePatient<ApiResponse<string>>(
          patientId,
          patient
        )
      : this.patientService.savePatient(patient);
    apiSub.subscribe({
      next: () => {
        this.isCallInitiated = false;
        this.cancel();
      },
      error: ({ error }: { error: ApiResponse<Map<string, unknown>> }) => {
        this.managePatientConflict(error.data);
        this.isCallInitiated = false;
      },
      complete: () => {
        this.isCallInitiated = false;
      },
    });
  }

  managePatientConflict(json: Map<string, unknown>): void {
    const statusCode = json['statusCode'];
    if (statusCode == 4) {
      // User reach it's max mapping
      this.notificationService.showWarning(
        'You can only add up to 6 profiles to your account.\n Please remove an existing profile to add a new one.',
        'Profile Limit Reached'
      );
    } else if (statusCode == 3 || statusCode == 6) {
      // 3 Patient is Alredy map with User | 6 patient is a user.
      this.notificationService.showWarning(
        'This mobile number is already associated with an existing patient.\n Please select the patient from the drop-down list to proceed.',
        'Patient Already Registered'
      );
    } else if (statusCode == 5 || statusCode == 2) {
      // (5 User is doctor | 2 User is Valid) - ready to attach with Patient
      this.notificationService.showWarning(
        'This mobile number is already associated with an existing user.',
        'User Already Registered'
      );
    }
  }

  sendOTP(): void {
    if (
      !this.familyMemberMobileNumber ||
      (this.familyMemberMobileNumber + '').length < 10
    ) {
      this.notificationService.showWarning('Please enter valid mobile number');
      return;
    }

    this.profileFetchOTP = undefined;
    this.isOTPSent = false;
    this.formattedTime.set('');
    this.resendOTP();
  }

  resendOTP(): void {
    this.userService
      .sendProfileFetchOTP(this.familyMemberMobileNumber)
      .subscribe(() => {
        this.isOTPSent = true;
        this.subscription?.unsubscribe();
        this.subscription = this.dateTimeUtilityService
          .startCountdown(this.countdownTime)
          .subscribe((time) => {
            this.formattedTime.set(time);
          });
        this.confirmationService.close();

        this.confirmationService.confirm({
          header: 'User Verification',
          key: 'patient-profile-fetch',
          rejectVisible: false,
          acceptVisible: false,
        });
      });
  }

  submitOTP(): void {
    const params = new HttpParams()
      .append('mobileNumber', this.familyMemberMobileNumber)
      .append('otp', this.profileFetchOTP);
    this.patientService
      .getProfilesByPhoneNumber<PatientProfileSelectionDTO[]>(params)
      .subscribe((data) => {
        if (data?.length > 0) {
          this.selectedProfile = undefined;
          this.profileSuggestions = data;
          this.isProfileSelectionVisible.set(true);
          this.confirmationService.close();
        } else {
          this.profileSuggestions = [];
          this.notificationService.showInfo('No Patient Found');
          this.confirmationService.close();
        }
      });
  }

  onRowSelect(event: TableRowSelectEvent): void {
    this.patientService.getPatient<Patient>(event.data.patientId).subscribe({
      next: (data) => {
        const patient = data;
        this.profileForm.patchValue({
          patientId: patient.patientId ?? null,
          title: patient.title ?? null,
          firstName: patient.firstName ?? null,
          middleName: patient.middleName ?? null,
          lastName: patient.lastName ?? null,
          gender: patient.gender ?? null,
          genderFreeText: patient.genderFreeText ?? null,
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth)
            : null,
          maritalStatus: patient.maritalStatus ?? null,
          maritalStatusFreeText: patient.maritalStatusFreeText ?? null,

          aadharNumber: patient.aadharNumber ?? null,
          abhaId: patient.abhaId ?? null,
          preferredLanguages: patient.preferredLanguages ?? ['en-US'],

          address1: patient.address1 ?? null,
          address2: patient.address2 ?? null,
          city: patient.city ?? null,
          state: patient.state ?? null,
          country: patient.country ?? null,
          pincode: patient.pincode ?? null,
          alternateMobileNumber: patient.alternateMobileNumber ?? null,

          bloodGroup: patient.bloodGroup ?? null,
          communicationModes: patient.communicationModes ?? [1, 2],
          stillFamilyMember: true,

          joinCurrentUserAs: 1,
          joinCurrentUser: true,
        });

        const emergencyContactsFA = this.profileForm.get(
          'emergencyContacts'
        ) as FormArray;
        emergencyContactsFA?.clear();

        if (
          patient?.emergencyContacts &&
          patient?.emergencyContacts.length > 0
        ) {
          patient.emergencyContacts.forEach((emergencyContact) => {
            this.addEmergencyContacts(emergencyContact);
          });
        } else {
          this.addEmergencyContacts();
        }
        this.isProfileSelectionVisible.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
