import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressComponent } from "@component/common/address/address.component";
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { InsuranceListComponent } from '@component/insurance/insurance-list/insurance-list.component';
import { APP_ROUTES } from '@constants/app.constants';
import { REGEX } from '@constants/regex.constant';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';
import { ApiResponse } from '@interface/api-response.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { EmergencyContact } from '@interface/patient-profile.interface';
import { PatientDTO, UserProfile } from '@interface/user-profile.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { UserService } from '@service/user.service';
import { UtilityService } from '@service/utility.service';
import { CustomValidators } from '@validator/custom.validator';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { Subject, takeUntil } from 'rxjs';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-user-profiles',
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
    PageHeaderDirective,
    TranslateModule,
    MandatoryFieldLabelDirective,
    ConfirmDialogModule,
    DateMaskDirective,
    MultiSelectModule,
    InputGroupModule,
    TableModule,
    DatePickerModule,
    InputMaskModule,
    InputGroupAddonModule,
    AddressComponent,
    FileUploadComponent,
    PhoneNumberMaskDirective,
    InsuranceListComponent,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './user-profiles.component.html'
})
export class UserProfilesComponent implements OnInit, OnDestroy {

   private readonly route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private readonly platformService = inject(PlatformService);
  private readonly patientService = inject(PatientService);
  private readonly userService = inject(UserService);
  private readonly masterService = inject(MasterService);
  private readonly notificationService = inject(NotificationService);
  private readonly utilityService = inject(UtilityService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly _router = inject(Router);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);

  alphaNumeric: RegExp = REGEX.ALPHA_NUMERIC;
  numeric: RegExp = REGEX.NUMERIC;
  alphaNumericSpace: RegExp = REGEX.ALPHA_NUMERIC_SPACE;
  addressRegex: RegExp = REGEX.ADDRESS_LINE_REGEX;
  middleNamePattern: RegExp =  REGEX.MIDDLE_NAME_REGEX;

  documentTypes = ".jpeg,.png,.jpg";
  mode: 'add-family' | 'update' = 'update';
  isBrowser = false;
  profileForm: FormGroup;
  currentDate: Date | undefined;
  isCallInitiated = false;
  private readonly destroy$ = new Subject<void>();
  readonly minDateOfBirth = new Date('1900-01-01')


  genders: LabelValue<number>[] = [];
  titles: LabelValue<string>[] = [];
  languages: LabelValue<string>[] = [];
  maritalStatuses: LabelValue<number>[] = [];
  patientRelationShips: LabelValue<number>[] = [];
  userRelationShips: LabelValue<number>[] = [];
  bloodGroups: LabelValue<string>[] = [];
  communicationModes: LabelValue<number>[] = [];
  patient = signal<string | null>(null);

  constructor(
  ) {
    this.isBrowser = this.platformService.isBrowser();

  }

  get patientId(): string {
    return this.profileForm?.get('patientId').value;
  }

  get getEmergencyContacts(): FormArray {
    const emergencyContacts = this.profileForm.get('emergencyContacts') as FormArray;
    return emergencyContacts;
  }

  get gender(): boolean {
    return 0 == this.profileForm?.get('gender').value;
  }


  get maritalStatus(): boolean {
    return 0 == this.profileForm?.get('maritalStatus').value;
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    if (!this.isBrowser) return;

    const patientId = this.localStorageService.getPatientId();
    const userId = this.localStorageService.getloggedinUserId();
    this.patient.set(patientId);
    this.getProfileData(userId, patientId);
    this.initializeMasterData();
  }

   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProfileData(userId: string, patientId: string): void {
    if (!userId || (this.mode == 'update' && !patientId)) {
      this.cancel();
      return;
    }
    if (this.mode == 'update') {
      this.patientService.getPatient<PatientDTO>(patientId).subscribe({
        next: (data) => {
          this.initializeForm(data);
        }, error: () => { this.cancel() }
      });
    } else {
      this.userService.getUser<UserProfile>(userId).subscribe({
        next: (data) => {
          const initialData: PatientDTO = {
            mobileNumber: data.mobileNumber,
            email: data.email,
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            preferredLanguages: data.preferredLanguages,
            communicationModes: data.communicationModes,
            joinCurrentUser: true,
            emergencyContacts: [{
              contactId: null,
              contactName: data.firstName + ' ' + (data.lastName || ''),
              contactNumber: data.mobileNumber,
              contactRelation: null,
              orderPosition: 1
            }]
          };
          this.initializeForm(initialData);
        }
        , error: () => { this.cancel() }
      })

    }
  }

  navigateTo(route: string): void {
    this._router.navigate([route]);
  }

  cancel(): void {
    this.navigateTo(APP_ROUTES.DASHBOARD);
  }

  initializeForm(patient?: PatientDTO): void {
    this.profileForm = this._fb.group({
      patientId: new FormControl<string | null>({ value: patient?.patientId, disabled: true }),
      title: new FormControl<string | null>(patient?.title),
      firstName: new FormControl<string | null>(patient?.firstName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      middleName: new FormControl<string | null>(patient?.middleName, [Validators.maxLength(50), Validators.pattern(this.middleNamePattern)]),
      lastName: new FormControl<string | null>(patient?.lastName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      gender: new FormControl<number | null>(patient?.gender, [Validators.required]),
      genderFreeText: new FormControl<string | null>(patient?.genderFreeText, [Validators.maxLength(64), Validators.pattern(this.alphaNumeric)]),
      dateOfBirth: new FormControl<Date | null>(patient?.dateOfBirth ? new Date(patient?.dateOfBirth) : undefined, [Validators.required]),
      age: new FormControl<string | null>({ value: null, disabled: true }),
      maritalStatus: new FormControl<number | null>(patient?.maritalStatus),
      maritalStatusFreeText: new FormControl<string | null>(patient?.maritalStatusFreeText, [Validators.maxLength(64), Validators.pattern(this.alphaNumeric)]),


      aadharNumber: new FormControl<string | null>(patient?.aadharNumber, [Validators.maxLength(12), Validators.pattern(this.numeric)]),
      abhaId: new FormControl<string | null>(patient?.abhaId, [Validators.maxLength(14), Validators.pattern(this.alphaNumeric)]),
      preferredLanguages: new FormControl<string[] | null>(patient?.preferredLanguages ?? ['en-US'], []),

      address1: new FormControl<string | null>(patient?.address1, [Validators.required, Validators.maxLength(255), CustomValidators.addressValidator('invalidAddress')]),
      address2: new FormControl<string | null>(patient?.address2, [Validators.maxLength(255), CustomValidators.addressValidator('invalidAddress')]),
      city: new FormControl<string | null>(patient?.city, [Validators.required, Validators.maxLength(50)]),
      state: new FormControl<string | null>(patient?.state, [Validators.required, Validators.maxLength(50)]),
      country: new FormControl<string | null>(patient?.country, [Validators.required, Validators.maxLength(100)]),
      pincode: new FormControl<string | null>(patient?.pincode, [Validators.required, Validators.maxLength(6), Validators.pattern(this.numeric)]),
      email: new FormControl<string | null>(patient?.email, [Validators.email, Validators.maxLength(100)]),
      mobileNumber: new FormControl<string | null>({ value: patient?.mobileNumber, disabled: true }, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      alternateMobileNumber: new FormControl<string | null>(patient?.alternateMobileNumber, [CustomValidators.mobileNumber]),

      bloodGroup: new FormControl<string | null>(patient?.bloodGroup),
      profilePicture: new FormControl<string | null>(undefined),
      emergencyContacts: new FormArray([], [Validators.required]),
      communicationModes: new FormControl<number[] | null>(patient?.communicationModes ?? [1, 2], []),

      joinCurrentUserAs: new FormControl<number | undefined>(undefined, patient.joinCurrentUser ? [Validators.required] : []),
      joinCurrentUser: new FormControl<boolean>(patient.joinCurrentUser ?? false),

    });

    if (patient?.emergencyContacts && patient?.emergencyContacts.length > 0) {
      patient.emergencyContacts.forEach((emergencyContact) => {
        this.addEmergencyContacts(emergencyContact);
      })
    } else {
      this.addEmergencyContacts();
    }
  }

  addEmergencyContacts(emergencyContact?: EmergencyContact, fromHtml = false): void {
    if (this.getEmergencyContacts.length >= 10) {
      this.notificationService.showWarning('Maximum 10 emergency contact details can be added');
      return;
    }
    if (fromHtml) {
      if (this.getEmergencyContacts.invalid) {
        this.utilityService.markControlsAsDirtyAndTouched(this.getEmergencyContacts);
        return;
      }
    }
    const contactDetailForm = this._fb.group({
      id: new FormControl<number | null>({ value: new Date().getTime(), disabled: true }),
      contactId: new FormControl<string | null>(emergencyContact?.contactId),
      contactName: new FormControl<string | null>(emergencyContact?.contactName,
        [Validators.maxLength(50), Validators.pattern(this.alphaNumericSpace) ]
      ),
      contactNumber: new FormControl<string | null>(
        emergencyContact?.contactNumber,
        [CustomValidators.mobileNumber]
      ),
      contactRelation: new FormControl<number | null>(
        emergencyContact?.contactRelation
      ),
      orderPosition: new FormControl<number | null>(this.getEmergencyContacts.length),
    })

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
      const emergencyContacts = this.profileForm.get('emergencyContacts') as FormArray;
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
      const fixedDate = new Date(Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()));
      this.profileForm.get('dateOfBirth').patchValue(fixedDate);

      const age = this.dateTimeUtilityService.convertDateToAgePSP(fixedDate);
      this.profileForm.get('age').setValue(age);
    }
  }

  initializeMasterData(): void {
    this.currentDate = new Date();

    const params = ['TITLE', 'GENDER', 'LANGUAGE', 'MARITAL_STATUS', 'PATIENT_RELATION_SHIPS', 'BLOOD_GROUP', 'COMMUNICATION_MODE'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach(res => {
        switch (res.name) {
          case 'TITLE':
            this.titles = res.value as LabelValue<string>[];
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
            this.userRelationShips = (res.value as LabelValue<number>[] || []).filter(e => e.value != 1);
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
      })
    })
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
      this.notificationService.showWarning('Duplicate emergency contact number found');
      return;
    }

    const patientId = this.profileForm.get('patientId').value;

    const patient = { ...this.profileForm.value };
    patient['emergencyContacts'] =
     this.getEmergencyContacts.value.filter(e=> !!e['contactNumber'] );

    patient['mobileNumber'] = this.profileForm.get('mobileNumber').value;
    patient['email'] = this.profileForm.get('email').value;
    if (patientId) {
      this.patientService.updatePatient<string>(patientId, patient).subscribe({
        next: () => {
          this.isCallInitiated = false;
          this.cancel();
          this.userService.isMemberAdded.set(true);
        },
        error: () => {
          this.isCallInitiated = false
        },
        complete: () => { this.isCallInitiated = false }
      })
    } else {
      this.patientService.savePatient(patient).subscribe({
        next: () => {
          this.isCallInitiated = false
          this.cancel();
          this.userService.isMemberAdded.set(true);
        },
        error: ({ error }: { error: ApiResponse<Map<string, unknown>> }) => {
          this.managePatientConflict(error.data)
          this.isCallInitiated = false
        },
        complete: () => { this.isCallInitiated = false }
      })
    }
  }

  managePatientConflict(json: Map<string, unknown>): void {
    const statusCode = json['statusCode'];
    if (statusCode == 4) {// User reach it's max mapping
      this.notificationService.showWarning("You can only add up to 6 profiles to your account.\n Please remove an existing profile to add a new one.", "Profile Limit Reached")
    } else if (statusCode == 3 || statusCode == 6) {// 3 Patient is Alredy map with User | 6 patient is a user.
      this.notificationService.showWarning("This mobile number is already associated with an existing patient.\n Please select the patient from the drop-down list to proceed.", "Patient Already Registered")
    } else if (statusCode == 5 || statusCode == 2) { // (5 User is doctor | 2 User is Valid) - ready to attach with Patient
      this.notificationService.showWarning("This mobile number is already associated with an existing user.", "User Already Registered")
    }
  }

}
