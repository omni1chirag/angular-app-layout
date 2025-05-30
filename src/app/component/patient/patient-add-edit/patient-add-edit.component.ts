import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressComponent } from '@component/common/address/address.component';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService } from 'primeng/api';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
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
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { Subject, Subscription, takeUntil } from 'rxjs';
interface LabelValue {
  label: string;
  value: any;
}

@Component({
  selector: 'app-patient-add-edit',
  imports: [ToolbarModule,
    InputNumberModule,
    InputMaskModule,
    DividerModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    CheckboxModule,
    ButtonModule,
    CommonModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
    SelectButtonModule,
    AddressComponent,
    PageHeaderDirective,
    TranslateModule,
    MandatoryFieldLabelDirective,
    AccordionModule,
    FileUploadComponent,
    TableModule,
    InputGroupModule,
    ConfirmDialogModule,
    InputGroupAddonModule,
    DateMaskDirective,
    AutoCompleteModule,
    PhoneNumberMaskDirective,
    InputOtpModule
  ],
  providers: [ConfirmationService],
  templateUrl: './patient-add-edit.component.html',
  styleUrl: './patient-add-edit.component.scss'
})
export class PatientAddEditComponent implements OnInit {

  alphaNumeric: RegExp = new RegExp(/^[a-zA-Z0-9]+$/)
  numeric: RegExp = new RegExp(/^[0-9]+$/)
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/)
  currentDate: Date | undefined;
  formSubscription$ = new Subject<void>();
  isCallInitiated: boolean = false;

  isBrowser: boolean = false;
  patientForm: FormGroup;
  mode: 'ADD_PATIENT' | 'EDIT_PATIENT' = 'ADD_PATIENT';
  genders: LabelValue[] = [];
  titles: LabelValue[] = [];
  languages: LabelValue[] = [];
  maritalStatuses: LabelValue[] = [];
  patientRelationShips: LabelValue[] = [];
  userRelationShips: LabelValue[] = [];
  bloodGroups: LabelValue[] = [];
  documentTypes = ".jpeg,.png,.jpg";
  availabelPatients: any[] = [];
  patientMapOTP;
  existingPatientId;
  formattedTime = '';
  countdownTime = 60;
  subscription!: Subscription;
  otpType = ['EMAIL'];
  isOTPSent = false;
  existingPatient;
  blackListControl= [];
  from;
  @ViewChild("mobileNumberAutoComplete")
  mobileNumberAutoComplete: AutoComplete;

  get gender(): boolean {
    return 0 == this.patientForm?.get('gender').value;
  }

  get patientId(): string {
    return this.patientForm?.get('patientId').value;
  }

  get maritalStatus(): boolean {
    return 0 == this.patientForm?.get('maritalStatus').value;
  }

  get getEmergencyContacts(): FormArray {
    const emergencyContacts = this.patientForm.get('emergencyContacts') as FormArray;
    return emergencyContacts;
  }

  constructor(private platformService: PlatformService,
    private _fb: FormBuilder,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private ngZone: NgZone,
    private masterService: MasterService,
    private activatedRoute: ActivatedRoute,
    private patientService: PatientService,
    private confirmationService: ConfirmationService,
    private _router: Router) {
    this.isBrowser = platformService.isBrowser();

  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const state = history.state;
    this.from = state.from || null;

    this.initializeMasterData();
    const patientId = this.activatedRoute.snapshot.params['id'] ?? this.activatedRoute.parent?.snapshot.params['id'];
    if (patientId) {
      this.mode = 'EDIT_PATIENT';
      this.getPatient(patientId);
    } else {
      this.initializeForm();
    }
  }

  ngOnDestroy(): void {
    this.formSubscription$.next();
    this.formSubscription$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initializeForm(patient?): void {
    this.patientForm = this._fb.group({
      patientId: new FormControl<string | null>({ value: patient?.patientId, disabled: true }),
      title: new FormControl<string | null>(patient?.title),
      firstName: new FormControl<string | null>(patient?.firstName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      middleName: new FormControl<string | null>(patient?.middleName, [Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      lastName: new FormControl<string | null>(patient?.lastName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      gender: new FormControl<any | null>(patient?.gender, [Validators.required]),
      genderFreeText: new FormControl<string | null>(patient?.genderFreeText, [Validators.maxLength(64), Validators.pattern(this.alphaNumeric)]),
      dateOfBirth: new FormControl<Date | null>(patient?.dateOfBirth ? new Date(patient?.dateOfBirth) : undefined, [Validators.required]),
      age: new FormControl<string | null>({ value: null, disabled: true }),
      maritalStatus: new FormControl<string | null>(patient?.maritalStatus),
      maritalStatusFreeText: new FormControl<string | null>(patient?.maritalStatusFreeText, [Validators.maxLength(64), Validators.pattern(this.alphaNumeric)]),

      aadharNumber: new FormControl<string | null>(patient?.aadharNumber, [Validators.required, Validators.maxLength(12), Validators.pattern(this.numeric)]),
      abhaId: new FormControl<string | null>(patient?.abhaId, [Validators.maxLength(14), Validators.pattern(this.alphaNumeric)]),
      preferredLanguages: new FormControl<string[] | null>(patient?.preferredLanguages ?? ['en-US'], [Validators.required]),

      address1: new FormControl<string | null>(patient?.address1, [Validators.required, Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
      address2: new FormControl<string | null>(patient?.address2, [Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
      city: new FormControl<string | null>(patient?.city, [Validators.required, Validators.maxLength(50)]),
      state: new FormControl<string | null>(patient?.state, [Validators.required, Validators.maxLength(50)]),
      country: new FormControl<string | null>(patient?.country, [Validators.required, Validators.maxLength(100)]),
      pincode: new FormControl<string | null>(patient?.pincode, [Validators.required, Validators.maxLength(6), Validators.pattern(this.numeric)]),
      email: new FormControl<string | null>(patient?.email, [Validators.required, Validators.email, Validators.maxLength(100)]),
      mobileNumber: new FormControl<string | null>(patient?.mobileNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      alternateMobileNumber: new FormControl<string | null>(patient?.mobileNumber, [Validators.minLength(10), Validators.maxLength(10)]),

      bloodGroup: new FormControl<string | null>(patient?.bloodGroup),
      profilePicture: new FormControl<string | null>(undefined),

      emergencyContacts: new FormArray([], [Validators.required]),
      joinCurrentUser: new FormControl<boolean>(false),
      joinCurrentUserAs: new FormControl<number | undefined>(undefined),
    })
    if (patient?.emergencyContacts && patient?.emergencyContacts.length > 0) {
      patient.emergencyContacts.forEach((emergencyContact) => {
        this.addEmergencyContacts(emergencyContact);
      })
    } else {
      this.addEmergencyContacts();
    }
    this.blackListControl = patient ? [] : ['mobileNumber'];
    if(patient){
      this.patientForm.get('mobileNumber').disable();
      this.patientForm.get('email').disable();
    }
    const addOrRemoveValidation = (gender) => {
      if (!gender && gender != 0) return;
      const genderFreeText = this.patientForm.get('genderFreeText') as FormControl;
      if (0 == gender) {
        if (!genderFreeText.hasValidator(Validators.required)) {
          genderFreeText.addValidators(Validators.required);
        }
      } else {
        if (genderFreeText.hasValidator(Validators.required)) {
          genderFreeText.removeValidators(Validators.required);
        }
      }
    }
    addOrRemoveValidation(this.patientForm.get('gender').value);
    this.patientForm.get('gender')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    this.calculateAge()
  }

  addEmergencyContacts(emergencyContact?, fromHtml?) {
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
      contactName: new FormControl<string | null>(emergencyContact?.contactName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumericSpace)]),
      contactNumber: new FormControl<string | null>(emergencyContact?.contactNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      contactRelation: new FormControl<string | null>(emergencyContact?.contactRelation, [Validators.required]),
      orderPosition: new FormControl<number | null>(this.getEmergencyContacts.length),
    })
    this.getEmergencyContacts.push(contactDetailForm);
    this.updateOrderPositions();
  }

  onRowReorder(event: any) {
    this.updateOrderPositions();
  }

  updateOrderPositions() {
    this.getEmergencyContacts.controls.forEach((control, index) => {
      control.get('orderPosition').setValue(index + 1);
    });
  }

  removeEmergencyContact(index: number) {
    if (index >= 0 && index < this.getEmergencyContacts.length) {
      const emergencyContacts = this.patientForm.get('emergencyContacts') as FormArray;
      emergencyContacts.removeAt(index);
      this.updateOrderPositions();
    }
  }

  calculateAge() {
    if (this.patientForm.get('dateOfBirth').value) {
      const birthDate = new Date(this.patientForm.get('dateOfBirth').value);
      const fixedDate = new Date(Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()));
      this.patientForm.get('dateOfBirth').patchValue(fixedDate);

      let age = this.utilityService.convertDateToAgePSP(fixedDate);
      this.patientForm.get('age').setValue(age);
    }
  }

  initializeMasterData() {
    this.currentDate = new Date();

    const params = ['TITLE', 'GENDER', 'LANGUAGE', 'MARITAL_STATUS', 'PATIENT_RELATION_SHIPS', 'BLOOD_GROUP'];
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'TITLE':
            this.titles = res.value
            break;
          case 'GENDER':
            this.genders = res.value;
            break;
          case 'LANGUAGE':
            this.languages = res.value
            break;
          case 'MARITAL_STATUS':
            this.maritalStatuses = res.value
            break;
          case 'PATIENT_RELATION_SHIPS':
            this.patientRelationShips = res.value
            this.userRelationShips = (res.value || []).filter(e => e.value != 1);
            break;
          case 'BLOOD_GROUP':
            this.bloodGroups = res.value
            break;
          default:
            console.log('name not found', res.name);
            break;
        }
      })
    })
  }

  getPatient(patientId) {
    this.patientService.getPatient(patientId).subscribe({
      next: ({ data, message }) => { this.initializeForm(data) },
      error: (error) => { this.cancel() }
    })
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }


  async save(): Promise<void> {
    if (this.patientForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.patientForm);
      return;
    }
    const isEmergencyContactValid = await this.validateEmergencyContact();
    if (!isEmergencyContactValid) {
      this.notificationService.showWarning('Duplicate emergency contact number found');
      return;
    }

    const patientId = this.patientForm.get('patientId').value;

    const patient = { ...this.patientForm.value };
    patient['mobileNumber'] = this.patientForm.get('mobileNumber').value;
    patient['email'] = this.patientForm.get('email').value;

    if (patientId) {
      this.patientService.updatePatient(patientId, patient).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
        },
        error: async (error: any) => {
          this.isCallInitiated = false
        },
        complete: () => { this.isCallInitiated = false }
      })
    } else {
      this.patientService.savePatient(patient).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.cancel(resp.data);
        },
        error: async (error: any) => {
          this.managePatientConflict(error.data)
          this.isCallInitiated = false
        },
        complete: () => { this.isCallInitiated = false }
      })
    }
    return;
  }

  managePatientConflict(json) {
    const statusCode = json['statusCode'];
    if (statusCode == 4) {// User reach it's max mapping
      this.notificationService.showWarning("You can only add up to 6 profiles to your account.\n Please remove an existing profile to add a new one.","Profile Limit Reached")
    } else if (statusCode == 3 || statusCode == 6) {// 3 Patient is Alredy map with User | 6 patient is a user.
      this.notificationService.showWarning("This mobile number is already associated with an existing patient.\n Please select the patient from the drop-down list to proceed.","Patient Already Registered")

    } else if (statusCode == 5 || statusCode == 2) { // (5 User is doctor | 2 User is Valid) - ready to attach with Patient 
      this.confirmationService.confirm({
        header: 'Alert',
        key: 'patient-map',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          text: true,
        },
        acceptButtonProps: {
          label: 'Save',
          text: true,
        },
        accept: async () => {
          this.patientForm.get('joinCurrentUser').setValue(true);
          await this.save();
          this.patientForm.get('joinCurrentUser').setValue(false);
          this.patientForm.get('joinCurrentUserAs').setValue(undefined);
        },
        reject: () => {
        }
      });
    }
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

  cancel(patientId?) {
    if(this.from === 'appointment-add-edit'){
      this._router.navigate(['/home/appointment/list'], {
        state: {
          patientId: patientId 
        }
      });
    } else if (patientId) {
      this.navigateTo(`/home/patient/${patientId}/summary`)
    } else if (this.patientId) {
      this.navigateTo('/home/patient/list')
    } else {
      this.navigateTo(`/home/patient/list`)
    }
  }

  setJoinCurrentUser($event) {
    this.patientForm.get('joinCurrentUserAs').setValue($event.value);

    console.log($event);

  }

  filterPatientByMobileNumber(event: { query: string }): void {
    const mobile = event.query?.trim();

    if (mobile.length !== 10 || isNaN(+mobile)) {
      this.availabelPatients = [];
      this.mobileNumberAutoComplete?.hide?.(true);
      return;
    }

    const params = new HttpParams().set('mobileNumber', mobile);

    this.patientService.getPatientByPhoneNumber(params).subscribe((resp: any) => {
      const patients = resp?.data ?? [];

      if (patients.length > 0) {
        this.availabelPatients = patients.map(p => ({
          ...p,
          mobileNumber: mobile
        }));
      } else {
        this.availabelPatients = [];
        // Ensure overlay is hidden if no data
        setTimeout(() => {
          this.mobileNumberAutoComplete?.hide?.(true);
        }, 1000);
      }
    });
  }

  patientSelect($event) {
    this.isOTPSent = false;
    this.otpType = undefined;
    this.patientMapOTP = undefined;
    this.existingPatient = undefined;
    const json = $event.value;
    this.existingPatientId = json.patientId;

    if (json.requiredOTPVerification) {
      this.patientService.getPatient(this.existingPatientId).subscribe({
        next: ({ data, message }) => { 
          this.existingPatient = data;
          this.otpType = [this.existingPatient?.email ? 'EMAIL':'SMS'];

          this.confirmationService.confirm({
            header: 'Patient Consent Verification',
            key: 'patient-map-doctor',
            rejectVisible: false,
            acceptVisible: false
          });
        }})
    } else {
      this.confirmationService.confirm({
        header: 'Alert',
        key: 'patient-exist',
        rejectVisible: false,
        acceptVisible: false,
        accept: async () => {
          this.cancel(this.existingPatientId);
        },
        reject: () => {
          this.cancel();
        }
      });
    }
  }

  submitOTP($event) {
    this.patientService.mapPatientToDoctor(
      { 'patientId': this.existingPatientId,
        'otp':this.patientMapOTP
       }
    ).subscribe(()=>{
      this.cancel(this.existingPatientId);
      this.confirmationService.close();
    })
  }

  resendOTP() {
    const json = {
      'patientId':this.existingPatientId,
      'otpType':this.otpType[0]
    }
    
    this.patientService.sendConsentOtp(json).subscribe((resp)=>{
      this.isOTPSent = true;
      this.subscription?.unsubscribe();
      this.subscription = this.utilityService.startCountdown(this.countdownTime).subscribe(time => {
        this.ngZone.run(() => {
          this.formattedTime = time;
        });
      });
    })
  }

  changeOPTPlatForm($event,type) {
    $event.checked = [type];
    this.otpType = [type];
  }


}