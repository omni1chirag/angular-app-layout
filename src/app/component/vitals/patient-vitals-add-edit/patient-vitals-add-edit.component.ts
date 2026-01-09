import { CommonModule } from '@angular/common';
import { Component, inject, input, model, OnInit, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelValueAndSignOff, PatientVitalResponse } from '@interface/vital-interface';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLangService } from '@service/multi-lang.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { VitalsService } from '@service/vital.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { VitalFieldComponent } from "@component/common/vital-field/vital-field.component";
import { LocalStorageService } from '@service/local-storage.service';
import { HttpParams } from '@angular/common/http';
import { TextareaModule } from 'primeng/textarea';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { PatientVitalService } from '@service/patient-vital.service';

@Component({
  selector: 'app-patient-vitals-add-edit',
  imports: [
    DrawerModule,
    ButtonModule,
    DividerModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    SplitButtonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    InputMaskModule,
    InputNumberModule,
    VitalFieldComponent,
    TextareaModule
  ],
  templateUrl: './patient-vitals-add-edit.component.html',
})
export class PatientVitalsAddEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly utilityService = inject(UtilityService);
  private readonly patientVitalService = inject(PatientVitalService);
  private readonly vitalService = inject(VitalsService);
  private readonly notificationService = inject(NotificationService);
  private readonly multiLangService = inject(MultiLangService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dateTimeService = inject(DateTimeUtilityService);
  isVisible = model<boolean>(false);
  vitalsId = input<string | undefined | null>(undefined);
  patientId = input<string | undefined | null>(undefined);
  appointmentId = input<string>();
  vitalsUpdate = output<void>();

  vitalsForm: FormGroup;
  vitalData: PatientVitalResponse = {} as PatientVitalResponse;
  isCallInitiated = false;
  isBrowser = false;
  vitalEntries;
  appointmentOptions: LabelValueAndSignOff[] = [];

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    this.getAppointmentLabels();
    if (this.vitalsId()) {
      this.getVitalsById(this.vitalsId());
    } else {
      this.initializeForm();
    }
  }

  initializeMasterData(): void {
    this.vitalEntries = this.vitalService.vitalList;
  }

  getVitalsById(vitalsId: string): void {
    this.patientVitalService.getVitalsById<PatientVitalResponse>(this.patientId(), vitalsId).subscribe({
      next: (data) => {
        this.vitalData = data;
        this.initializeForm(data);
      },
      error: () => {
        this.isVisible.set(false);
      }
    })

  }

  getAppointmentLabels(): void {
    const patientId = this.localStorageService.getPatientId();
    if (!patientId) return;

    const params = new HttpParams()
      .set('patientId', patientId)

    this.patientVitalService.getFutureAppointmentLabels<LabelValueAndSignOff[]>(params)
      .subscribe({
        next: (data) => (this.appointmentOptions = data),
        error: (err) => console.error('Failed to fetch appointment labels:', err),
      });
  }


  initializeForm(vitalOrder?: PatientVitalResponse): void {
    this.vitalsForm = this.fb.group({
      carePlanId: new FormControl<string | null>(vitalOrder?.carePlanId ?? null),
      notes: new FormControl<string | null>(vitalOrder?.notes ?? null),
      appointmentId: new FormControl<string | null>({
        value: vitalOrder?.appointmentId ?? this.appointmentId(), disabled: this.appointmentId() != undefined}),
      recordedDate: new FormControl<string | null>(
        vitalOrder?.recordedDate ?? this.dateTimeService.getCurrentDateTime()
      )
    });
  }

  onSubmit(): void {
    if (this.vitalsForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.vitalsForm);
      return;
    }
    const vitalsData = this.vitalsForm.getRawValue();
    let hasAtLeastOneVital = false;
    Object.keys(vitalsData).forEach((key) => {
      const vital = vitalsData[key];
      if (vital && typeof vital === 'object' && 'value' in vital) {
        if (vital.value === null || vital.value === undefined || vital.value === '') {
          delete vitalsData[key];
        } else {
          hasAtLeastOneVital = true;
        }
      }
    });
    if (!hasAtLeastOneVital) {
      this.multiLangService.getTranslateMsgFromKey('VITALS.VALIDATION.SELECT_AT_LEAST_ONE').then((message) => {
        this.notificationService.showWarning(message ?? 'Please enter at least one vital');
      })
      return;
    }
    this.isCallInitiated = true;
    const patientId = this.localStorageService.getPatientId();
    const apiCall = this.vitalsId()
      ? this.patientVitalService.updateVitals(patientId, this.vitalsId(), vitalsData)
      : this.patientVitalService.addVitals(patientId, vitalsData);

    apiCall.subscribe({
      next: () => {
        this.isCallInitiated = false;
        this.vitalsUpdate.emit();
        this.isVisible.set(false);
      },
      error: (error) => {
        this.isCallInitiated = false;
        console.error(error);
      }
    });
  }

}
