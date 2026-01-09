import { Component, effect, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, signal, Type, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrollSpyDirective } from '@directive/scroll-spy.directive';
import { DividerModule } from 'primeng/divider';

import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AllergyListComponent } from "@component/allergy/allergy-list/allergy-list.component";
import { CarePlanPatientListComponent } from "@component/care-plan-patient-list/care-plan-patient-list.component";
import { DiagnosisListComponent } from "@component/diagnosis/diagnosis-list/diagnosis-list.component";
import { DocumentListComponent } from "@component/document/document-list/document-list.component";
import { ImmunizationPatientListComponent } from "@component/immunization/immunization-patient-list/immunization-patient-list.component";
import { MedicalHistoryComponent } from '@component/medical-history/medical-history.component';
import { MedicationPatientListComponent } from '@component/medication/medication-patient-list/medication-patient-list.component';
import { PatientVitalsListComponent } from '@component/vitals/patient-vitals-list/patient-vitals-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '@service/appointment.service';
import { CommunicationService } from '@service/communication.service';
import { PlatformService } from '@service/platform.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { DoctorService } from '@service/doctor.service';
import { PatientLabListComponent } from '@component/patient-lab/patient-lab-list/patient-lab-list.component';
import { LocalStorageService } from '@service/local-storage.service';
import { AppointmentOption } from '@interface/appointment.interface';
import { LabelValue } from '@interface/common.interface';
import { ClinicProfileData, DoctorProfileData } from '@interface/clinical-summary.interface';
import { ClinicService } from '@service/clinic.service';
import { TabsModule } from "primeng/tabs";
import { AppointmentStatusBgColorPipe, AppointmentStatusLabelPipe, AppointmentTypeIconPipe } from '@pipe/appointment.pipe';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DateTimeUtilityService } from '@service/date-time-utility.service';

interface Section {
  id: string;
  isImmediate: boolean;
  component?: Type<unknown>;
  key: string;
  label?: string;
}

@Component({
  selector: 'app-clinical-summary',
  imports: [DividerModule,
    CommonModule,
    FormsModule,
    ScrollSpyDirective,
    ProgressSpinnerModule,
    ButtonModule,
    ToolbarModule,
    TranslateModule,
    ConfirmDialogModule,
    InputTextModule,
    TextareaModule,
    RadioButtonModule,
    CheckboxModule,
    SelectModule, TabsModule, AppointmentStatusLabelPipe, TimelineModule, TooltipModule,
    AppointmentTypeIconPipe, AppointmentStatusLabelPipe, AppointmentStatusBgColorPipe, CardModule],
  providers: [ConfirmationService],
  templateUrl: './clinical-summary.component.html',
  styleUrl: './clinical-summary.component.scss'
})
export class ClinicalSummaryComponent implements OnInit, OnDestroy {

  // injected services
  private readonly _platform = inject(PlatformService);
  private readonly _appointmentService = inject(AppointmentService);
  private readonly _comm = inject(CommunicationService);
  private readonly _doctorService = inject(DoctorService);
  private readonly _clinicService = inject(ClinicService);
  private readonly _localStorage = inject(LocalStorageService);
  private readonly _dateTimeService = inject(DateTimeUtilityService);

  @ViewChild('timelineContainer', { read: ElementRef }) readonly timelineContainer!: ElementRef<HTMLElement>;

  @Output() readonly doctorProfile = new EventEmitter<DoctorProfileData>();
  @Output() readonly clinicProfile = new EventEmitter<ClinicProfileData>();
  @Output() appointmentIdChange = new EventEmitter<string | null>();

  readonly isBrowser = this._platform.isBrowser();

  readonly patientId = signal<string>(this._localStorage.getPatientId());
  readonly appointmentId = signal<string | null>(null);
  readonly doctorId = signal<string | null>(null);
  readonly clinicId = signal<string | null>(null);
  readonly signOff = signal<number | null>(null);

  private readonly _destroy$ = new Subject<void>();

  sections: Section[] = [
    { id: 'medicalHistory', isImmediate: false, component: MedicalHistoryComponent, key: 'MEDICAL_HISTORY_LIST', label: 'Medical History' },
    { id: 'vitals', isImmediate: false, component: PatientVitalsListComponent, key: 'VITAL_LIST', label: 'Vitals' },
    { id: 'diagnosis', isImmediate: false, component: DiagnosisListComponent, key: 'CURRENT_DIAGNOSIS_LIST', label: 'Current Diagnosis' },
    { id: 'allergy', isImmediate: false, component: AllergyListComponent, key: 'ALLERGY_LIST', label: 'Allergies' },
    { id: 'medication', isImmediate: true, component: MedicationPatientListComponent, key: 'MEDICATION_PATIENT_LIST', label: 'Medications' },
    { id: 'lab', isImmediate: false, component: PatientLabListComponent, key: 'LAB_RADIOLOGY_LIST', label: 'Labs' },
    { id: 'immunization', isImmediate: false, component: ImmunizationPatientListComponent, key: 'IMMUNIZATION_PATIENT_LIST', label: 'Immunizations' },
    { id: 'careplan', isImmediate: true, component: CarePlanPatientListComponent, key: 'CARE_PLAN_PATIENT_LIST', label: 'Care Plans' },
    { id: 'document', isImmediate: false, component: DocumentListComponent, key: 'DOCUMENT_LIST', label: 'Documents' },
  ];

  allowedSections: Section[] = [];

  appointmentList: AppointmentOption[] = [];
  doctorOptions: LabelValue<string>[] = [];

  selectedAppointment?: AppointmentOption;
  selectedDate: string | null = null;
  selectedDoctor: string | null = null;
  copyType: 'fullChart' | 'sectional' = 'fullChart';
  selectedSections: string[] = [];
  appointmentDate = '';

  editableAppointmentStatuses = ['BOOKED', 'CONFIRMED', 'RESCHEDULED', 'ONGOING'];
  isModifiable = false;
  loading = false;
  reloadKey = 0;

  constructor() {

    // react to doctorId change
    effect(() => {
      const did = this.doctorId();
      if (did) {
        this.loadDoctorProfile(did);
      }
    });

    // react to clinicId change
    effect(() => {
      const cid = this.clinicId();
      if (cid) {
        this.loadClinicProfile(cid);
      }
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.initializeSections();
    this.fetchAppointments();
  }

  ngOnDestroy(): void {
    this._comm.unsubscribe();
    this._destroy$.next();
    this._destroy$.complete();
  }

  private initializeSections(): void {
    this.allowedSections = [...this.sections];
  }

  private evaluateModifiability(): void {
    const { appointmentStatus, appointmentDateTime } = this.selectedAppointment;

    const isEditable = this.editableAppointmentStatuses.includes(appointmentStatus);
    const isFuture = this._dateTimeService.isFutureDate(appointmentDateTime);

    this.isModifiable = isEditable && isFuture;
  }

  private async fetchAppointments(): Promise<void> {
    if (!this.patientId()) return;

    const params = new HttpParams().set('patientId', this.patientId());
    this.appointmentList = await firstValueFrom(this._appointmentService.getAppointmentLabels<AppointmentOption[]>(params));
    if (this.appointmentList.length > 0) {
      this.selectAppointment(this.appointmentList[this.appointmentList.length - 1]);
      this.scrollToLastTimelineItem();
    }
  }

  selectAppointment(appointment: AppointmentOption): void {
    this.selectedAppointment = appointment;
    this.appointmentDate = appointment.appointmentDateTime ?? '';
    this.appointmentId.set(appointment.appointmentId);
    this.doctorId.set(appointment.doctorId);
    this.clinicId.set(appointment.clinicId);
    this.incrementReloadKey();
    this.evaluateModifiability();
    this.appointmentIdChange.emit(this.appointmentId());
  }

  scrollTimeline(direction: number): void {
    const container = this.timelineContainer.nativeElement;
    const distance = container.clientWidth * 0.6;
    container.scrollTo({ left: container.scrollLeft + distance * direction, behavior: 'smooth' });
  }

  scrollToLastTimelineItem(): void {
    if (!this.timelineContainer) return;

    const container = this.timelineContainer.nativeElement;

    setTimeout(() => {
      container.scrollTo({
        left: container.scrollWidth, // full horizontal width
        behavior: 'smooth',
      });
    });
  }

  private loadDoctorProfile(doctorId: string): void {
    this._doctorService.getDoctorProfile<DoctorProfileData>(doctorId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: data => this.doctorProfile.emit(data),
        error: error => console.error('Error fetching doctor profile:', error)
      });
  }

  private loadClinicProfile(clinicId: string): void {
    this._clinicService.getClinicProfile<ClinicProfileData>(clinicId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: data => this.clinicProfile.emit(data),
        error: error => console.error('Error fetching clinic profile:', error)
      });
  }

  protected trackBySection = (_index: number, section: Section): string => {
    return `${section.id}-${this.reloadKey}`;
  };

  private incrementReloadKey(): void {
    this.reloadKey++;
  }

}
