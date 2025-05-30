import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, model, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule, InputNumber } from 'primeng/inputnumber';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AppointmentService } from '@service/appointment.service';
import { UtilityService } from '@service/utility.service';
import { timeRangeValidator } from '@validator/time-range.validator';
import { MasterService } from '@service/master.service';
import { PatientService } from '@service/patient.service';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificationService } from '@service/notification.service';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputOtpModule } from 'primeng/inputotp';
import { CheckboxModule } from 'primeng/checkbox';


class Appointment {
  appointmentId?: string;
  patient?: Patient;
  appointmentType?: string;
  doctorId?: string;
  practiceId?: string;
  appointmentDate?: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  reasonForVisit?: string;
  notes?: string;
  appointmentStatus?: string;
}

class Patient {
  patientId?: string;
}

interface LabelValue {
  label: string;
  value: any;
}
@Component({
  selector: 'app-appointment-add-edit',
  imports: [ToolbarModule,
    InputNumber,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    DividerModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    TextareaModule,
    SelectButtonModule,
    AutoComplete,
    AutoCompleteModule,
    DividerModule,
    TranslateModule,
    ReactiveFormsModule,
    DialogModule,
    TableModule,
    TooltipModule,
    DrawerModule,
    DateMaskDirective,
    ConfirmDialogModule,
    InputOtpModule,
    CheckboxModule
  ],
  providers: [ConfirmationService],
  templateUrl: './appointment-add-edit.component.html',
  styleUrl: './appointment-add-edit.component.scss'
})
export class AddEditAppointmentComponent implements OnInit, OnDestroy {

  isVisible = model<boolean>(false);
  @Output() onAppointmentUpdate = new EventEmitter<any>();

  readonly appointment = signal<{appointmentId?: string, appointmentStartDateTime?: Date, appointmentEndDateTime?: Date}>(null);

  @Input("appointment")
  set setAppointment(appointment: {appointmentId?: string, appointmentStartDateTime?: Date, appointmentEndDateTime?: Date}) {
    this.appointment.set(appointment);
  }

  @Input("isMobileNumberVisible")
  isMobileNumberVisible:boolean = true;


  isBrowser: boolean = false;
  mode: 'ADD_APPOINTMENT' | 'EDIT_APPOINTMENT' = 'ADD_APPOINTMENT';
  isCallInitiated: boolean = false;
  appointmentForm: FormGroup;
  searchPatientForm: FormGroup;
  organizationId: string;
  clinics: LabelValue[] = []
  doctors: LabelValue[] = [];
  appointmentTypes: LabelValue[] = [
    {
      "label": "In-Person",
      "value": "IN_PERSON"
    },
    {
      "label": "Virtual",
      "value": "VIRTUAL"
    }
  ];
  reasonsForVisits: LabelValue[] = [];
  appointmentStatus: LabelValue[] = [];
  currentDate: Date | undefined;

  alphaNumeric: RegExp = new RegExp(/^[a-zA-Z0-9]+$/)
  numeric: RegExp = new RegExp(/^[0-9]+$/)
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/)

  formSubscription$ = new Subject<void>();

  patientSuggestions: any[] = []
  rfvSuggestions: any[] = []

  otpType = ['EMAIL'];
  isOTPSent = false;
  patientMapOTP;
  formattedTime = '';
  countdownTime = 60;
  subscription!: Subscription;

  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }

  // Used for Patient list popup
  visible: boolean = false;

  @Input("patient")
  patient;


  showDialog() {
    this.visible = true;
  }

  navigateToListPage() {
    this.router.navigateByUrl('/home/appointment/list');
  }

  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private _fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private appointmentService: AppointmentService,
    private utilityService: UtilityService,
    private masterService: MasterService,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.searchPatientForm = this._fb.group({
        mobileNumber: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(10)]),
      });
      this.organizationId = this.utilityService.getOrganizationId();
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeMasterData();
      // const { params } = this.activatedRoute.snapshot;
      // const appointmentId = params['id'];
      if (this.appointment()?.appointmentId) {
        this.mode = 'EDIT_APPOINTMENT';
        this.isMobileNumberVisible = false;
        this.getAppointment(this.appointment()?.appointmentId);
      } else {
        this.initializeForm().then(() => {
          this.utilizeMasterData();
        });
      }
    }
  }

  ngOnDestroy() {
    this.formSubscription$.next();
    this.formSubscription$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getAppointment(appointmentId) {
    this.appointmentService.getAppointment(appointmentId).subscribe({
      next: ({ data, message }) => {
        this.initializeForm(data).then(() => {
          this.utilizeMasterData();
        });
      },
      error: (error) => { this.navigateToListPage() }
    })
  }

  initializeMasterData() {
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    const setClinics = (organizationId, firstLoad?) => {
      if (!organizationId) {
        this.clinics = [];
        this.appointmentForm.get('clinicId').setValue(undefined);
        return;
      }
      this.appointmentService.getClinicLabels(organizationId).subscribe((resp: any) => {
        this.clinics = resp.data;
        if (!firstLoad) {
          this.appointmentForm.get('clinicId').setValue(undefined);
        }
      })
    }
    setClinics(this.organizationId, true);

    const params = ['APPOINTMENT_STATUS'];
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'APPOINTMENT_STATUS':
            this.appointmentStatus = res.value;
            break;
          default:
            console.log('name not found', res.name);
            break;
        }

      })
    })
  }

  async initializeForm(appointment: any = this.appointment()): Promise<void> {
    const selectedPatient = appointment?.patient || this.patient;
    const patientId = selectedPatient?.patientId ?? null;
    const patientName = selectedPatient?.firstName && selectedPatient?.lastName
      ? `${selectedPatient.firstName}, ${selectedPatient.lastName}`
      : '';

    const appointmentDateTime = appointment?.appointmentStartDateTime
      ? this.utilityService.separateDateAndTime(appointment.appointmentStartDateTime)
      : { date: null, time: null };

    const endDateTime = appointment?.appointmentEndDateTime
      ? this.utilityService.separateDateAndTime(appointment.appointmentEndDateTime)
      : { time: null };

    this.appointmentForm = this._fb.group({
      appointmentId: new FormControl<string | null>(
        { value: appointment?.appointmentId ?? null, disabled: true }
      ),
      clinicId: new FormControl<string | null>(
        appointment?.clinicId ?? null,
        [Validators.required]
      ),
      patient: new FormGroup({
        patientId: new FormControl<string | null>(
          patientId,
          [Validators.required]
        ),
        patientName: new FormControl<string | null>(
          patientName,
          [Validators.required]
        ),
      }),
      doctorId: new FormControl<string | null>(
        appointment?.doctorId ?? null,
        [Validators.required]
      ),
      appointmentType: new FormControl<string | null>(
        appointment?.appointmentType ?? 'IN_PERSON',
        [Validators.required]
      ),
      appointmentDate: new FormControl<Date | null>(
        appointmentDateTime.date,
        [Validators.required]
      ),
      startTime: new FormControl<string | null>(
        appointmentDateTime.time,
        [Validators.required]
      ),
      endTime: new FormControl<string | null>(
        endDateTime.time,
        [Validators.required]
      ),
      duration: new FormControl<string | null>(
        '', // Assuming to be calculated or entered separately
        [Validators.required]
      ),
      reasonForVisit: new FormControl<string | null>(
        appointment?.reasonForVisit ?? null
      ),
      notes: new FormControl<string | null>(
        appointment?.notes ?? null,
        [Validators.maxLength(300)]
      ),
      appointmentStatus: new FormControl<string | null>(
        appointment?.appointmentStatus ??
        { value: "SCHEDULED", disabled: true },
        [Validators.required]
      ),
    }, { validators: timeRangeValidator });
  }


  utilizeMasterData() {
    const setProvider = (clinicId: string, firstLoad = false) => {
      if (!clinicId) {
        this.doctors = [];
        this.appointmentForm.get('doctorId')?.setValue(null);
        return;
      }

      this.appointmentService.getDoctorLabels(clinicId).subscribe((resp: any) => {
        this.doctors = resp.data || [];

        if (this.doctors.length > 0) {
          if (this.mode === 'ADD_APPOINTMENT')
            this.appointmentForm.get('doctorId')?.setValue(this.doctors[0]?.value);
        } else {
          this.appointmentForm.get('doctorId')?.setValue(null);
        }

        if (!firstLoad) {
          this.appointmentForm.get('doctorId')?.updateValueAndValidity();
        }
      });
    };

    this.appointmentForm.get('clinicId')?.valueChanges
      .pipe(takeUntil(this.formSubscription$))
      .subscribe((clinicId) => {
        this.appointmentForm.get('doctorId')?.setValue(null);
        this.appointmentForm.get('doctorId')?.updateValueAndValidity();
        setProvider(clinicId);
      });


    const initialClinicId = this.appointmentForm.get('clinicId')?.value;
    if (initialClinicId) {
      setProvider(initialClinicId, true);
    }

    const setDuration = () => {
      const startTime = this.appointmentForm.get('startTime')?.value;
      const endTime = this.appointmentForm.get('endTime')?.value;
      if (startTime && endTime) {
        const duration = this.getDurationString([startTime, endTime]);
        this.appointmentForm.get('duration')?.setValue(duration);
      } else {
        this.appointmentForm.get('duration')?.setValue(null);
      }
    }

    setDuration();
    this.appointmentForm.get('startTime')?.valueChanges
      .pipe(takeUntil(this.formSubscription$))
      .subscribe((startTime) => {
        if (startTime) {
          setDuration();
        }
      });
    this.appointmentForm.get('endTime')?.valueChanges
      .pipe(takeUntil(this.formSubscription$))
      .subscribe((endTime) => {
        if (endTime) {
          setDuration();
        }
      });
  }


  searchPatient(event) {
    if (!this.organizationId || !event || event.length === 0) {
      this.notificationService.showError('Please enter mobile number');
      return;
    }
    this.patientService.getPatientByPhoneNumber({ mobileNumber: event, organizationId: this.organizationId }).subscribe((resp: any) => {
      if (resp?.data?.length > 0) {
        this.patientSuggestions = resp.data;
        this.showDialog();
      } else {
        this.patientSuggestions = [];
        this.notificationService.showInfo('No Patient Found');
        this.utilityService.markControlsAsDirtyAndTouched(this.appointmentForm.get('patient') as FormGroup);
      }
    }
    );
  }

  clearPatient() {
    this.appointmentForm.get('patient')?.patchValue({ patientId: null });
  }

  searchRFV(event: AutoCompleteCompleteEvent) {
    const query = event.query?.trim();
    if (!query || query.length < 3) return;

    this.masterService.getRFVMaster({ reason: query }).subscribe((resp: any) => {
      const suggestions = resp?.data ?? [];

      const matchExists = suggestions.some(
        (item: any) => item.label.toLowerCase() === query.toLowerCase()
      );

      if (!matchExists) {
        suggestions.unshift({ label: query, value: query });
      }

      this.rfvSuggestions = suggestions;
    });
  }

  clearRFV() {
    this.appointmentForm.get('reasonForVisit')?.patchValue(null);
  }

  save() {
    if (!this.isBrowser || this.appointmentForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.appointmentForm); return;
    }

    const { appointmentId, appointmentDate, startTime, endTime, reasonForVisit } = this.appointmentForm.getRawValue();

    // Combine date and time into ISO strings
    const startDateTime = this.utilityService.combineDateAndTime(appointmentDate, startTime);
    const endDateTime = this.utilityService.combineDateAndTime(appointmentDate, endTime);


    const payload = {
      ...this.appointmentForm.getRawValue(),
      appointmentStartDateTime: startDateTime,
      appointmentEndDateTime: endDateTime,
    };
    console.log('payload', payload);
    this.isCallInitiated = true;
    if (appointmentId) {
      this.appointmentService.updateAppointment(appointmentId, payload).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.onAppointmentUpdate.emit(resp);
        },
        error: async (error: any) => {
          this.isCallInitiated = false
          this.notificationService.showError(error.error.message);
        },
        complete: () => { this.isCallInitiated = false }
      })
    } else {
      this.appointmentService.createAppointment(payload).subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.onAppointmentUpdate.emit(resp);
          this.navigateToListPage();
        },
        error: async (error: any) => {
          this.isCallInitiated = false
          this.notificationService.showError(error.error.message);
        },
        complete: () => { this.isCallInitiated = false }
      });
    }
  }



  getDurationString(times: string[]): number {
    const today = new Date();
    const datePart = today.toISOString().split('T')[0]; // e.g., "2025-05-01"

    const start = new Date(`${datePart}T${times[0]}:00`);
    const end = new Date(`${datePart}T${times[1]}:00`);

    const diffInMs = end.getTime() - start.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  }

  addPatient() {
    this.router.navigate(['/home/patient/add'], {
      state: {
        from: "appointment-add-edit"
      }
    });

  }

  selectedPatient!: any;

  onRowSelect(event: any) {
    console.log('Selected Patient:', event.data);
    if (event.data?.requiredOTPVerification) {
      this.notificationService.showError('Patient is not verified. Please verify the patient first.');

      this.isOTPSent = false;
      this.otpType = undefined;
      this.patientMapOTP = undefined;
      this.selectedPatient = event.data;
      this.otpType = [this.selectedPatient?.email ? 'EMAIL' : 'SMS'];

      this.confirmationService.confirm({
        header: 'Patient Consent Verification',
        key: 'patient-map-doctor',
        rejectVisible: false,
        acceptVisible: false,
        accept: async () => {

        },
        reject: () => {
          this.isOTPSent = false;
          this.otpType = undefined;
          this.patientMapOTP = undefined;
          this.selectedPatient = null;
        }
      });
    } else {
      this.appointmentForm.get('patient')?.patchValue({ patientId: event.data.patientId, patientName: event.data.patientFullName });
      this.appointmentForm.get('patient')?.updateValueAndValidity();

      this.visible = false; // Close the dialog after selection
      this.patientSuggestions = []; // Clear the suggestions after selection
    }
  }

  onRowUnselect(event: any) {
    console.log('Unselected Patient:', event.data);
  }

  changeOPTPlatForm($event, type) {
    $event.checked = [type];
    this.otpType = [type];
  }

  resendOTP() {
    const json = {
      'patientId': this.selectedPatient.patientId,
      'otpType': this.otpType[0]
    }

    this.patientService.sendConsentOtp(json).subscribe((resp) => {
      this.isOTPSent = true;
      this.subscription?.unsubscribe();
      this.subscription = this.utilityService.startCountdown(this.countdownTime).subscribe(time => {
        this.ngZone.run(() => {
          this.formattedTime = time;
        });
      });
    })
  }

  submitOTP($event) {
    this.patientService.mapPatientToDoctor(
      {
        'patientId': this.selectedPatient.patientId,
        'otp': this.patientMapOTP
      }
    ).subscribe(() => {
      this.appointmentForm.get('patient')?.patchValue({ patientId: this.selectedPatient.patientId, patientName: this.selectedPatient.patientFullName });
      this.appointmentForm.get('patient')?.updateValueAndValidity();

      this.visible = false; // Close the dialog after selection
      this.patientSuggestions = []; // Clear the suggestions after selection
      this.confirmationService.close();
    })
  }

  restrictUnselect(event: any) {
    if (!event.value) {
      this.appointmentForm.get('appointmentType')?.setValue(this.appointmentForm.get('appointmentType').value);
    }
  }
}
