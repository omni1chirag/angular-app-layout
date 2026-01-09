import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SelectButton, SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  first,
  firstValueFrom,
  of,
  Subject,
  switchMap,
  takeUntil,
  lastValueFrom,
  map
} from 'rxjs';

// Services
import { AppointmentService } from '@service/appointment.service';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { DoctorService } from '@service/doctor.service';
import { DocumentService } from '@service/document.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { RazorpayService } from '@service/razorpay.service';
import { SlotManagerService } from '@service/slot-manager.service';
import { UtilityService } from '@service/utility.service';

// Interfaces
import {
  Appointment,
  AppointmentType,
  VisitMaster,
} from '@interface/appointment.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import {
  AppointmentValidators,
  Clinic,
  DateEntry,
  DateSlotData,
  DayPart,
  DoctorDetail,
  LoadingState,
  SelectedSlotInfo,
  Slot,
  TimeGroupedSlots,
} from '@interface/doctor-profile.interface';
import { DocumentListResponse } from '@interface/document.interface';
import { OrderModel } from '@model/order.model';
import { PaymentModel } from '@model/payment.model';

// PrimeNG
import { ConfirmationService } from 'primeng/api';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { FloatLabel } from 'primeng/floatlabel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';

// Other imports
import { PageHeaderDirective } from '@directive/page-header.directive';
import { environment } from '@environment/environment';
import { PaymentRecord } from '@interface/payment.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentAddEditComponent } from 'src/app/document-add-edit/document-add-edit.component';
import { PaymentGatewayService } from '@service/payment-gateway.service';

@Component({
  selector: 'app-doctor-profile',
  imports: [
    SelectButton,
    SelectButtonModule,
    SelectModule,
    CommonModule,
    FormsModule,
    TextareaModule,
    RadioButtonModule,
    ToolbarModule,
    ButtonModule,
    TabsModule,
    AvatarModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    TranslateModule,
    PageHeaderDirective,
    Dialog,
    ProgressSpinner,
    FloatLabel,
    Divider,
    DocumentAddEditComponent,
    TableModule,
    ConfirmDialog,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.scss',
})
export class DoctorProfileComponent implements OnInit, OnDestroy {
  // ==================== DEPENDENCY INJECTION ====================
  private readonly platformService = inject(PlatformService);
  private readonly doctorService = inject(DoctorService);
  private readonly masterService = inject(MasterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly dateTimeUtil = inject(DateTimeUtilityService);
  private readonly utilityService = inject(UtilityService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly documentService = inject(DocumentService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly ngZone = inject(NgZone);
  private readonly slotManager = inject(SlotManagerService);
  private readonly razorpayService = inject(RazorpayService);
  private readonly paymentGateway = inject(PaymentGatewayService);

  // ==================== PUBLIC READONLY PROPERTIES ====================
  readonly isBrowser = this.platformService.isBrowser();
  readonly host = environment.host;
  readonly LoadingState = LoadingState;
  readonly patientId = this.localStorageService.getPatientId();

  // ==================== SIGNALS ====================
  readonly loadingState = signal<LoadingState>(LoadingState.IDLE);
  readonly imageError = signal<boolean>(false);
  readonly confirmDialogVisible = signal<boolean>(false);
  readonly isCallInitiated = signal<boolean>(false);
  readonly doctor = signal<DoctorDetail | null>(null);
  readonly consultationFee = signal<number | null>(null);
  readonly patientLastAppointmentDate = signal<Date>(null);

  // From slot manager
  readonly dates = this.slotManager.dates;
  readonly isLoadingSlots = this.slotManager.isLoading;
  readonly selectedSlotInfo = this.slotManager.selectedSlotInfo;
  readonly slotMetadata = this.slotManager.metadata;

  // Computed
  readonly hasAvailableSlots = computed(() => {
    const dates = this.dates();
    const appointmentType = this.appointmentForm?.get('appointmentType')?.value;
    if (!dates.length || !appointmentType) return false;

    return dates.some((date) => {
      const count = this.slotManager.getSlotCount(
        date.date,
        appointmentType === 'IN_PERSON' ? 'clinic' : 'virtual'
      );
      return count > 0;
    });
  });

  // ==================== VIEW CHILDREN ====================
  @ViewChild('tabList', { read: ElementRef })
  tabListEl!: ElementRef<HTMLElement>;
  @ViewChild('documentTable') documentTable: Table;
  @ViewChild('rfv_auto') rfv_autoComplete!: AutoComplete;

  // ==================== COMPONENT STATE ====================
  appointmentForm!: FormGroup<{
    appointmentId: FormControl<string | null>;
    clinicId: FormControl<string | null>;
    patient: FormGroup<{ patientId: FormControl<string | null> }>;
    doctorId: FormControl<string | null>;
    appointmentType: FormControl<AppointmentType>;
    startDateTime: FormControl<string | null>;
    endDateTime: FormControl<string | null>;
    reasonForVisit: FormControl<string[] | null>;
    notes: FormControl<string | null>;
    appointmentStatus: FormControl<string | null>;
  }>;

  rfvSuggestions: LabelValue<string>[] = [];
  consultTypes: LabelValue<AppointmentType>[] = [];

  // Tab state
  activeTab = 0;
  previousTab = 0;
  mode: 'add' | 'reschedule' = 'add';
  paymentMode: 'ONLINE' | 'CASH' | null = null;
  dayParts: DayPart[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Document state
  documentId: string | null = null;
  isDocumentVisible = false;
  documents: DocumentListResponse[] = [];
  documentIds: string[] = [];

  // Navigation elements
  private viewport?: HTMLElement;
  private btnNext?: HTMLButtonElement;
  private btnPrev?: HTMLButtonElement;

  // Intersection observer
  private tabIntersectionObserver?: IntersectionObserver;
  private readonly visibleTabIndexes = new Set<number>();

  // Reactive streams
  private readonly destroy$ = new Subject<void>();
  private readonly formSubscription$ = new Subject<void>();
  private readonly clinicChange$ = new BehaviorSubject<string | null>(null);

  // Debounce
  private debounceTimer?: number;
  private readonly DEBOUNCE_TIME = 300;

  // ==================== GETTERS / SETTERS ====================

  get doctorId(): string | null {
    return this.appointmentForm?.get('doctorId')?.value ?? null;
  }

  set doctorId(value: string | null) {
    this.appointmentForm?.get('doctorId')?.setValue(value);
  }

  get clinicId(): string | null {
    return this.appointmentForm?.get('clinicId')?.value ?? null;
  }

  set clinicId(value: string | null) {
    this.appointmentForm
      ?.get('clinicId')
      ?.setValue(value, { emitEvent: false });
  }

  get appointmentId(): string | null {
    return this.appointmentForm?.get('appointmentId')?.value ?? null;
  }

  get appointmentType(): AppointmentType {
    return this.appointmentForm?.get('appointmentType')?.value ?? null;
  }

  get startDateTime(): string {
    return this.appointmentForm?.get('startDateTime')?.value;
  }

  // ==================== LIFECYCLE HOOKS ====================

  constructor() {
    if (!this.isBrowser) return;

    // Configure slot manager
    this.slotManager.configure({
      initialDateRangeDays: 15,
      loadChunkSize: 15,
      maxCachedSlots: 30,
      cacheExpiryMs: 10 * 60 * 1000,
      prefetchThreshold: 5,
      debounceMs: 300,
    });

    this.initializeMasterData();
    this.setupReactiveStreams();
    this.setupSlotEffects();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    this.destroy$.next();
    this.destroy$.complete();
    this.formSubscription$.next();
    this.formSubscription$.complete();
    this.unbindListeners();
    this.tabIntersectionObserver?.disconnect();
  }

  // ==================== INITIALIZATION ====================

  private async initializeComponent(): Promise<void> {
    try {
      this.loadingState.set(LoadingState.LOADING);

      const { appointmentId, appointment } =
        await this.resolveAppointmentContext();
      const doctorId =
        appointment?.doctorId || this.route.snapshot.paramMap.get('id');

      if (appointment) {
        this.mode = 'reschedule';
        appointment.appointmentStatus = 'RESCHEDULED';
        this.loadDocumentsByAppointment(appointmentId);
      }
      await this.loadPatientLastAppointmentDate(doctorId);
      await this.initializeForm(appointment);
      await this.loadDoctorProfile(doctorId, appointmentId, appointment);

      this.loadingState.set(LoadingState.SUCCESS);
    } catch (error) {
      this.loadingState.set(LoadingState.ERROR);
      this.handleError(error, 'Failed to initialize component');
    }
  }

  private async loadPatientLastAppointmentDate(
    doctorId: string
  ): Promise<void> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('patientId', this.patientId);

    const lastDate = await firstValueFrom(
      this.appointmentService.getLastAppointmentDateOfPatient<Date | null>(
        params
      )
    );

    this.patientLastAppointmentDate.set(lastDate);
  }

  private async resolveAppointmentContext(): Promise<{
    appointmentId: string | null;
    appointment: Appointment | null;
  }> {
    const urlSegments = this.route.snapshot.url;
    const lastSegment = urlSegments[urlSegments.length - 1]?.path;

    if (lastSegment !== 'reschedule') {
      return { appointmentId: null, appointment: null };
    }

    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (!appointmentId) {
      return { appointmentId: null, appointment: null };
    }

    const appointment = await this.getAppointment(appointmentId);
    return { appointmentId, appointment };
  }

  private async initializeForm(appointment: Appointment | null): Promise<void> {
    const defaultClinicId =
      appointment?.clinicId ?? this.doctor()?.clinics[0]?.clinicId ?? null;

    this.appointmentForm = this.fb.group({
      appointmentId: this.fb.control<string | null>({
        value: appointment?.appointmentId ?? null,
        disabled: true,
      }),
      clinicId: this.fb.control<string | null>(
        { value: defaultClinicId, disabled: this.mode === 'reschedule' },
        [Validators.required]
      ),
      patient: this.fb.group({
        patientId: this.fb.control<string | null>(this.patientId, [
          Validators.required,
        ]),
      }),
      doctorId: this.fb.control<string | null>(appointment?.doctorId ?? null, [
        Validators.required,
      ]),
      appointmentType: this.fb.control<AppointmentType>(
        appointment?.appointmentType ?? 'IN_PERSON',
        [Validators.required]
      ),
      startDateTime: this.fb.control<string | null>(
        appointment?.appointmentStartDateTime,
        [Validators.required, AppointmentValidators.pastDateValidator]
      ),
      endDateTime: this.fb.control<string | null>(
        appointment?.appointmentEndDateTime,
        [Validators.required]
      ),
      reasonForVisit: this.fb.control<string[] | null>(
        appointment?.reasonForVisit ?? null,
        [AppointmentValidators.reasonForVisitRequired]
      ),
      notes: this.fb.control<string | null>(appointment?.notes ?? null, [
        Validators.maxLength(300),
      ]),
      appointmentStatus: this.fb.control<string | null>(
        {
          value: appointment?.appointmentStatus ?? 'BOOKED',
          disabled: true,
        },
        [Validators.required]
      ),
    });

    this.subscribeToFormChanges();
  }

  // ==================== DOCTOR & SLOTS LOADING ====================
  // private startDate = this.dateTimeUtil.todayDate();
  //   private endDate = this.dateTimeUtil.datePlus(this.startDate, 14 - 1);
  //   private startingSlotIndex = 0;
  private async loadDoctorProfile(
    doctorId: string,
    appointmentId: string | null,
    appointment: Appointment | null
  ): Promise<void> {
    if (!doctorId) {
      throw new Error('Doctor ID not found');
    }

    this.doctorId = doctorId;

    // Load doctor basic details
    const doctorData = await this.fetchDoctorBasicInfo(doctorId);

    doctorData['aboutTabs'] = [
      {
        label: 'About',
        content:
          'Dr. Ravi Sharma is a leading cardiologist with over 15 years of experience treating complex heart diseases. He has performed more than 2000 successful angioplasties.',
      },
      {
        label: 'Education',
        content:
          'MBBS from AIIMS Delhi, MD Cardiology from PGIMER Chandigarh, Fellowship in Interventional Cardiology from Cleveland Clinic, USA.',
      },
      {
        label: 'Experience',
        content:
          'Worked as Senior Consultant at Fortis Hospital for 8 years. Currently Head of Cardiology at Apollo Hospitals, Bangalore.',
      },
      {
        label: 'Awards',
        content:
          'Recipient of the Indian Medical Association Gold Medal (2015). Recognized among Top 10 Cardiologists in India by MedWorld (2020).',
      },
      {
        label: 'Publications',
        content:
          'Published 25+ research papers in international journals on preventive cardiology and stent technology.',
      },
    ];

    this.doctor.set(doctorData);
    if (this.consultTypes?.length) {
      const modes = doctorData.consultationMode;
      const ctrl = this.appointmentForm.get('appointmentType');

      this.consultTypes = this.consultTypes.filter((t) =>
        modes.includes(t.value)
      );

      if (this.consultTypes.length === 1) {
        ctrl?.setValue(this.consultTypes[0].value);
        ctrl?.disable();
      }
      this.updateConsultationFee(ctrl.value);
    }

    // Set clinic
    const clinicId =
      appointment?.clinicId ??
      this.clinicId ??
      doctorData.clinics?.[0]?.clinicId ??
      null;

    this.clinicId = clinicId;

    // Initialize slot manager
    await this.initializeSlotManager(
      doctorId,
      clinicId,
      appointmentId,
      appointment
    );

    // Setup tab navigation after slots are loaded
    this.ngZone.onStable.pipe(first()).subscribe(() => {
      this.bindTabNavButtons();
      this.observeTablistForRebind();

      // Restore slot selection for reschedule
      if (appointment && this.startDateTime) {
        this.restoreSlotSelection(appointment);
      }
    });
  }

  private async fetchDoctorBasicInfo(doctorId: string): Promise<DoctorDetail> {
    return firstValueFrom(
      this.doctorService.getDoctorBasicDetails<DoctorDetail>(doctorId)
    );
  }

  private async initializeSlotManager(
    doctorId: string,
    clinicId: string,
    appointmentId: string | null,
    appointment: Appointment | null
  ): Promise<void> {
    // Determine start date based on mode
    let startDate = this.dateTimeUtil.todayDate();
    let daysToLoad = 15;

    if (appointment && this.mode === 'reschedule') {
      const appointmentDate = this.dateTimeUtil.formatDate(
        appointment.appointmentStartDateTime
      );
      const today = this.dateTimeUtil.todayDate();

      // Calculate which date range to load based on appointment date
      const daysDiff = this.dateTimeUtil.getDaysBetween(today, appointmentDate);

      if (daysDiff > 15) {
        // If appointment is more than 2 months away, adjust start date
        const weeksAway = Math.floor(daysDiff / 7);
        startDate = this.dateTimeUtil.datePlus(today, (weeksAway - 1) * 7);
        daysToLoad = 30; // Load 3 months to ensure appointment date is visible
      } else if (daysDiff >= 10 && daysDiff <= 15) {
        daysToLoad = 30;
      }
    }

    // Initialize date list and load slots
    await this.slotManager.initialize({
      startDate,
      daysToLoad,
      loadSlots: true,
      clinicId,
      doctorId,
      appointmentId,
    });

    // Set active tab to appointment date if reschedule
    if (appointment && this.startDateTime) {
      const appointmentDate = this.dateTimeUtil.formatDate(this.startDateTime);
      const dateIndex = this.slotManager.getIndexOfDate(appointmentDate);
      if (dateIndex !== -1) {
        this.dateChange(dateIndex);
      }
    }
  }

  private restoreSlotSelection(appointment: Appointment): void {
    if (!this.startDateTime) return;

    const date = this.dateTimeUtil.formatDate(this.startDateTime);
    const time = this.dateTimeUtil.formatTime(this.startDateTime);

    this.slotManager.restoreSlotSelection(
      date,
      time,
      appointment.appointmentType
    );

    // Scroll to the selected date
    const dateIndex = this.slotManager.getIndexOfDate(date);
    if (dateIndex !== -1) {
      this.dateChange(dateIndex)
      setTimeout(() => this.scrollToTab(dateIndex), 200);
    }
  }

  // ==================== REACTIVE STREAMS ====================

  private initializeMasterData(): void {
    const params = ['CONSULT_TYPE'];

    this.masterService
      .getCommonMasterData<CommonMaster<unknown>[]>(params)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.handleError(error, 'Failed to load master data');
          return of({ data: [] });
        })
      )
      .subscribe((data) => {
        (data as CommonMaster<unknown>[]).forEach((res) => {
          if (res.name === 'CONSULT_TYPE') {
            this.consultTypes =
              (res.value as LabelValue<AppointmentType>[]) || [];
          }
        });
      });
  }

  private setupReactiveStreams(): void {
    // Clinic change stream
    this.clinicChange$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.DEBOUNCE_TIME),
        distinctUntilChanged(),
        switchMap((clinicId) => {
          if (!clinicId || !this.doctorId) return EMPTY;
          return this.handleClinicChange(clinicId);
        })
      )
      .subscribe();

    // Doctor change from route
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const newDoctorId = params.get('id');
      if (this.doctorId && this.doctorId !== newDoctorId) {
        this.ngOnInit();
      }
    });
  }

  private subscribeToFormChanges(): void {
    const clinicControl = this.appointmentForm?.get('clinicId');

    if (clinicControl) {
      clinicControl.valueChanges
        .pipe(takeUntil(this.formSubscription$))
        .subscribe((clinicId) => {
          this.clinicChange$.next(clinicId);
        });
    }
    const appointmentTypeControl = this.appointmentForm?.get('appointmentType');
    if (appointmentTypeControl) {
      appointmentTypeControl.valueChanges
        .pipe(takeUntil(this.formSubscription$))
        .subscribe((appointmentType) => {
          this.updateConsultationFee(appointmentType);
        });
    }
  }

  private updateConsultationFee(appointmentType: AppointmentType) {
    if (appointmentType == 'IN_PERSON') {
      this.consultationFee.set(
        this.doctor()?.consultationCharge?.newPatient?.inPersonAmount ?? 0
      );
    } else {
      this.consultationFee.set(
        this.doctor()?.consultationCharge?.newPatient?.videoCallAmount ?? 0
      );
    }
    this.dateChange(this.activeTab ?? 0)
  }

  private async handleClinicChange(clinicId: string): Promise<void> {
    try {
      // Reset slot manager
      this.slotManager.reset();
      this.dateChange(0);
      // Reinitialize with new clinic
      await this.slotManager.initialize({
        startDate: this.dateTimeUtil.todayDate(),
        daysToLoad: 15,
        loadSlots: true,
        clinicId,
        doctorId: this.doctorId,
        appointmentId: this.appointmentId,
      });

      // Rebind tab navigation
      this.ngZone.onStable.pipe(first()).subscribe(() => {
        this.bindTabNavButtons();
        this.observeAllTabs();
      });
    } catch (error) {
      this.handleError(error, 'Failed to load clinic slots');
    }
  }

  // ==================== SLOT EFFECTS ====================

  private setupSlotEffects(): void {
    // Monitor visibility changes for auto-loading
    effect(() => {
      const metadata = this.slotMetadata();
      const dates = this.dates();

      if (dates.length > 0) {
        console.warn('Slot metadata updated:', metadata);
      }
    });

    effect(() => {
      const visibleState = this.slotManager['visibilityState'](); // Access visibility state

      if (
        visibleState.visibleDateIndexes.size > 0 &&
        this.clinicId &&
        this.doctorId
      ) {
        // Debounce this check
        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = window.setTimeout(() => {
          this.slotManager
            .reloadExpiredSlotsForVisibleDates(
              this.clinicId,
              this.doctorId,
              this.appointmentId
            )
            .catch((error) => {
              console.error('Failed to reload expired slots:', error);
            });
        }, 1000); // Wait 1 second after visibility change
      }
    });
  }

  // ==================== SLOT INTERACTION ====================

  onSlotSelection(dateEntry: DateEntry, slot: Slot, dayPart: DayPart): void {
    const slotData = this.slotManager.getSlotsForDate(dateEntry.date);
    if (!slotData) return;

    // If selecting a new date, clear previous selections
    const currentSelection = this.selectedSlotInfo();
    if (currentSelection && currentSelection.date !== dateEntry.date) {
      this.slotManager.clearSlotSelection();
    }

    // Toggle slot
    if (!slot.booked) {
      const doctorSetup = this.slotManager.calendarSetup();
      if (!doctorSetup) return;

      const startDateTime = this.dateTimeUtil.formatDateTime(
        dateEntry.date,
        slot.time
      );
      const endDateTime = this.dateTimeUtil.formatDateTimeWithAdd(
        dateEntry.date,
        slot.time,
        doctorSetup.slotDuration
      );

      this.appointmentForm?.get('startDateTime')?.setValue(startDateTime);
      this.appointmentForm?.get('endDateTime')?.setValue(endDateTime);

      const info: SelectedSlotInfo = {
        date: dateEntry.date,
        time: slot.time,
        appointmentType: this.appointmentType,
        dayPart,
      };

      this.slotManager.selectSlot(info);
      this.previousTab = this.activeTab;
    } else {
      // Deselect
      this.appointmentForm?.get('startDateTime')?.setValue(null);
      this.appointmentForm?.get('endDateTime')?.setValue(null);
      this.slotManager.clearSlotSelection();
    }
  }

  getSlots(dateEntry: DateEntry): DateSlotData | null {
    return this.slotManager.getSlotsForDate(dateEntry.date);
  }

  getSlotCount(dateEntry: DateEntry): number {
    if (!this.appointmentType) return 0;
    return this.slotManager.getSlotCount(
      dateEntry.date,
      this.appointmentType === 'IN_PERSON' ? 'clinic' : 'virtual'
    );
  }

  getDisplaySlots(dateEntry: DateEntry): TimeGroupedSlots | null {
    const slotData = this.getSlots(dateEntry);
    if (!slotData || !this.appointmentType) return null;

    return this.appointmentType === 'IN_PERSON'
      ? slotData.clinicGroupedSlots
      : slotData.virtualGroupedSlots;
  }

  // ==================== TAB NAVIGATION ====================

  private bindTabNavButtons(): void {
    const root = this.tabListEl?.nativeElement;
    if (!root) return;

    this.viewport =
      root.querySelector<HTMLElement>('.p-tablist-viewport') ?? undefined;
    this.btnNext = root.querySelector<HTMLButtonElement>(
      '.p-tablist-next-button'
    );
    this.btnPrev = root.querySelector<HTMLButtonElement>(
      '.p-tablist-prev-button'
    );

    this.unbindListeners();
    this.setupTabIntersectionObserver();

    this.btnNext?.addEventListener('click', this.onNextClick, {
      passive: true,
    });
    this.btnPrev?.addEventListener('click', this.onPrevClick, {
      passive: true,
    });
  }

  private unbindListeners(): void {
    this.btnNext?.removeEventListener('click', this.onNextClick);
    this.btnPrev?.removeEventListener('click', this.onPrevClick);
    this.tabIntersectionObserver?.disconnect();
  }

  private readonly onNextClick = (): void => {
    this.debouncedAction(() => this.checkAndLoadMore(), 0);
  };

  private readonly onPrevClick = (): void => {
    this.debouncedAction(() => this.checkAndLoadMore(), 250);
  };

  private setupTabIntersectionObserver(): void {
    const root = this.tabListEl?.nativeElement;
    if (!root || !this.viewport) return;

    this.tabIntersectionObserver?.disconnect();
    this.visibleTabIndexes.clear();

    const options: IntersectionObserverInit = {
      root: this.viewport,
      rootMargin: '0px',
      threshold: 0.5,
    };

    this.tabIntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const tabElement = entry.target as HTMLElement;
        const tabIndex = parseInt(
          tabElement.getAttribute('data-tab-index') || '-1',
          10
        );

        if (tabIndex < 0) return;

        if (entry.isIntersecting) {
          this.visibleTabIndexes.add(tabIndex);
        } else {
          this.visibleTabIndexes.delete(tabIndex);
        }
      });

      // Update slot manager visibility
      this.slotManager.updateVisibility(new Set(this.visibleTabIndexes));
    }, options);

    this.observeAllTabs();
  }

  private observeAllTabs(): void {
    const root = this.tabListEl?.nativeElement;
    if (!root) return;

    const tabButtons = root.querySelectorAll('p-tab button');
    tabButtons.forEach((button, index) => {
      (button as HTMLElement).setAttribute('data-tab-index', index.toString());
      this.tabIntersectionObserver?.observe(button);
    });
  }

  private checkAndLoadMore(): void {
    if (this.visibleTabIndexes.size === 0) return;

    const visibleIndexes = Array.from(this.visibleTabIndexes).sort(
      (a, b) => a - b
    );
    const minIndex = visibleIndexes[0];
    const maxIndex = visibleIndexes[visibleIndexes.length - 1];
    const totalDates = this.dates().length;

    const threshold = 5; // Load when within 5 tabs of edge

    // Load previous
    if (minIndex <= threshold && this.slotManager.canLoadPrevious()) {
      console.warn('Loading previous dates');
      this.loadMoreSlots('previous');
    }

    // Load next
    if (
      totalDates - 1 - maxIndex <= threshold &&
      this.slotManager.canLoadNext()
    ) {
      console.warn('Loading next dates');
      this.loadMoreSlots('next');
    }
  }

  private async loadMoreSlots(direction: 'previous' | 'next'): Promise<void> {
    if (!this.doctorId || !this.clinicId) return;

    try {
      await this.slotManager.extendDateList(direction, {
        clinicId: this.clinicId,
        doctorId: this.doctorId,
        appointmentId: this.appointmentId,
        autoLoadSlots: true,
      });

      // Re-observe tabs after DOM update
      setTimeout(() => {
        this.observeAllTabs();
        this.cdr.detectChanges();

        // Maintain scroll position for previous load
        if (direction === 'previous') {
          this.scrollToTab(10); // Scroll to a stable position
        }
      }, 100);
    } catch (error) {
      this.handleError(error, `Failed to load ${direction} dates`);
    }
  }

  private observeTablistForRebind(): void {
    const el = this.tabListEl?.nativeElement;
    if (!el) return;

    const observer = new MutationObserver(() => {
      this.bindTabNavButtons();
      setTimeout(() => this.observeAllTabs(), 100);
    });

    observer.observe(el, { childList: true, subtree: true });

    this.destroy$.pipe(takeUntil(this.destroy$)).subscribe({
      complete: () => observer.disconnect(),
    });
  }

  private scrollToTab(tabIndex: number): void {
    const tabEl =
      this.tabListEl?.nativeElement?.querySelectorAll('p-tab')?.[tabIndex];
    if (tabEl) {
      tabEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }

  private debouncedAction(fn: () => void, delay: number): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = window.setTimeout(() => {
      this.ngZone.run(() => fn());
    }, delay);
  }

  // ==================== APPOINTMENT BOOKING ====================

  confirmAppointment(): void {
    if (this.appointmentForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.appointmentForm);
      return;
    }
    this.confirmDialogVisible.set(true);
  }

  async saveAppointment(): Promise<void> {
    if (!this.isBrowser || this.appointmentForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.appointmentForm);
      return;
    }

    this.isCallInitiated.set(true);

    try {
      await this.validateSlotAvailability();
      await this.submitAppointment(this.consultationFee());
      this.confirmDialogVisible.set(false);
    } catch (error) {
      this.handleError(error, 'Failed to book appointment');
    } finally {
      this.isCallInitiated.set(false);
    }
  }

  captureOnlinePayment(appointment: Appointment): Promise<PaymentRecord> {
    // 1. Prepare HttpParams

    // 2. Build the Observable Chain
    const paymentObservable = this.paymentGateway.createAppointmentOrder(appointment).pipe(
      // Ensure the Observable completes after the first value
      first(),

      // Chain to the payment service
      switchMap((order: OrderModel) => {
        // Start the payment process using the fetched order
        return this.razorpayService.pay(order).pipe(
          first(),

          // Map the successful PaymentModel response into the desired PaymentRecord format
          map((paymentResponse: PaymentModel) => {
            const paymentRecord = {} as PaymentRecord;

            paymentRecord.amount = order.amount; // Use the amount from the OrderModel
            paymentRecord.paymentId = paymentResponse.paymentId;
            paymentRecord.paymentMethod = paymentResponse.method.toUpperCase();
            paymentRecord.razorpayStatus = paymentResponse.status.toUpperCase();
            paymentRecord.acquirerData = paymentResponse.acquirerData;
            paymentRecord.fee = paymentResponse.fee;
            paymentRecord.tax = paymentResponse.tax;
            paymentRecord.currency = paymentResponse.currency;
            paymentRecord.createdAt = paymentResponse.createdAt;
            paymentRecord.description = "Appointment";

            return paymentRecord;
          }),

          // Handle payment failure/dismissal error
          catchError((paymentError) => {
            if (paymentError.message === 'dismissed') {
              console.warn('Payment process was cancelled.');
              // Throwing an Error here causes lastValueFrom to reject the Promise
              throw new Error('Payment process was cancelled.');
            }
            console.error('Payment failed:', paymentError);
            throw paymentError;
          })
        );
      }),

      // Handle error from the first Observable (getDoctorConsultationCharge)
      catchError((orderError) => {
        console.error('Failed to get consultation charges:', orderError);
        throw new Error('Failed to prepare payment order.');
      })
    );

    // 3. Convert the Observable to a Promise using the modern utility
    return lastValueFrom(paymentObservable);
  }

  private async validateSlotAvailability(): Promise<void> {
    const calendarSetup = this.slotManager.calendarSetup();

    if (
      calendarSetup?.doubleBooking == null &&
      calendarSetup?.maxBookingsPerSlot == null
    ) {
      return;
    }

    const formValue = this.appointmentForm.getRawValue();
    let httpParams = new HttpParams()
      .set('clinicId', formValue.clinicId)
      .set('doctorId', formValue.doctorId)
      .set('startDateTime', formValue.startDateTime)
      .set('endDateTime', formValue.endDateTime);

    if (formValue.appointmentId) {
      httpParams = httpParams.set('appointmentId', formValue.appointmentId);
    }

    const resp = await firstValueFrom(
      this.appointmentService.checkAppointmentAvailability(httpParams)
    );

    const currentBookings = resp?.data ?? 0;

    const isDoubleBookingNotAllowed = !calendarSetup.doubleBooking;
    const isInvalidMaxSlot =
      calendarSetup.doubleBooking && calendarSetup.maxBookingsPerSlot === 0;
    const isMaxReached =
      calendarSetup.doubleBooking &&
      calendarSetup.maxBookingsPerSlot > 0 &&
      currentBookings >= calendarSetup.maxBookingsPerSlot;

    if (isDoubleBookingNotAllowed && currentBookings > 0) {
      throw new Error(
        'This slot is already booked. Double booking is not allowed.'
      );
    }

    if (isInvalidMaxSlot) {
      throw new Error(
        'Double booking is enabled but no maximum bookings per slot is defined.'
      );
    }

    if (isMaxReached) {
      throw new Error(
        `This slot already has ${currentBookings} bookings. Maximum allowed is ${calendarSetup.maxBookingsPerSlot}.`
      );
    }
  }

  private async submitAppointment(amount: number): Promise<void> {
    const formValue = this.appointmentForm.getRawValue();

    const {
      clinicId,
      doctorId,
      appointmentId,
      patient,
      appointmentType,
      reasonForVisit,
      notes,
      appointmentStatus,
      startDateTime,
      endDateTime,
    } = formValue;

    let paymentRecord = {} as PaymentRecord;

    if (this.paymentMode === 'ONLINE') {
      const payload: Appointment = {};
      payload.clinicId = clinicId;
      payload.doctorId = doctorId;
      payload.patient = patient;
      payload.appointmentType = appointmentType;
      payload.appointmentStartDateTime = startDateTime;

      paymentRecord = await this.captureOnlinePayment(payload);
    }
    if (this.paymentMode === 'CASH') {
      paymentRecord.paymentStatus = 'PENDING';
      paymentRecord.amount = amount;
    }
    paymentRecord.paymentMode = this.paymentMode;
    paymentRecord.description = 'Appointment';

    // If available, include the clinic’s business account ID for directing the payment transfer
    const matchingClinic = this.doctor().clinics.find(
      (clinic) => clinic.clinicId === clinicId
    );
    const accountId = matchingClinic
      ? matchingClinic.businessAccountId ?? null
      : null;
    paymentRecord.recipientAccountId = accountId;

    const payload = {
      clinicId,
      doctorId,
      appointmentId,
      patient,
      appointmentType,
      reasonForVisit,
      notes,
      appointmentStatus,
      appointmentStartDateTime: startDateTime,
      appointmentEndDateTime: endDateTime,
      paymentRecord,
      ...(this.documentIds?.length ? { documentIds: this.documentIds } : {}),
    };

    const request$ = formValue.appointmentId
      ? this.appointmentService.updateAppointment(
        formValue.appointmentId,
        payload
      )
      : this.appointmentService.createAppointment(payload);

    await firstValueFrom(request$).then(() => this.navigateToListPage());
  }

  async getAppointment(appointmentId: string): Promise<Appointment> {
    try {
      return await firstValueFrom(
        this.appointmentService.getAppointment<Appointment>(appointmentId).pipe(
          catchError((error) => {
            console.error('Error fetching appointment details:', error);
            this.navigateToListPage();
            throw error;
          })
        )
      );
    } catch (error) {
      console.error('Error in getAppointment:', error);
      throw error;
    }
  }

  navigateToListPage(): void {
    this.router.navigateByUrl('/home/appointment/list');
  }

  closeConfirmDialog(): void {
    this.confirmDialogVisible.set(false);
    this.paymentMode = null;
  }

  // ==================== REASON FOR VISIT ====================

  searchRFV(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.trim();
    if (!query || query.length < 3) {
      this.rfvSuggestions = [];
      return;
    }

    this.masterService
      .getRFVMaster<VisitMaster[]>(new HttpParams().append('reason', query))
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of<VisitMaster[]>([]))
      )
      .subscribe((data) => {
        const suggestions: LabelValue<string>[] = data ?? [];

        const matchExists = suggestions.some(
          (item: VisitMaster) =>
            item.label.toLowerCase() === query.toLowerCase()
        );

        if (!matchExists) {
          suggestions.unshift({ label: query, value: query });
        }

        this.rfvSuggestions = suggestions;
      });
  }

  clearRFV(): void {
    this.appointmentForm.get('reasonForVisit')?.patchValue(null);
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  loadDocumentsByAppointment(appointmentId: string): void {
    if (!this.isBrowser || !appointmentId) return;

    let params = new HttpParams()
      .set('patientId', this.patientId)
      .set('appointmentId', appointmentId);

    [{ field: 'docTitle', order: 1 }]?.forEach((sort) => {
      const field = sort.field;
      const order = sort.order;
      params = params.append(
        'sort',
        field + ' ' + (order == 1 ? 'asc' : 'desc')
      );
    });

    this.documentService
      .getDocumentsByPatientAndAppointment<DocumentListResponse[]>(params)
      .subscribe({
        next: (data) => {
          this.documents = data;
        },
      });
  }

  loadDocuments(): void {
    if (!this.isBrowser) return;

    let params = new HttpParams().set(
      'documentIds',
      this.documentIds.join(',')
    );

    [{ field: 'docTitle', order: 1 }]?.forEach((sort) => {
      const field = sort.field;
      const order = sort.order;
      params = params.append(
        'sort',
        field + ' ' + (order == 1 ? 'asc' : 'desc')
      );
    });

    this.documentService
      .getDocumentsByIds<DocumentListResponse[]>(params)
      .subscribe({
        next: (data) => {
          this.documents = data;
        },
      });
  }

  viewDocument(documentId: string): void {
    this.documentService.viewDocument(documentId);
  }

  addEditDocument(documentId: string | null): void {
    this.documentId = documentId;
    this.isDocumentVisible = true;
  }

  documentUpdate(documentId: string): void {
    this.documentTable.clear();
    this.documentIds.push(documentId);
    this.loadDocuments();
  }

  deleteDocument(documentId: string): void {
    this.confirmationService.confirm({
      key: 'remove-document-confirmation-dialog',
      header: 'Alert',
      message: 'Do you want to delete this document?',
      closable: false,
      blockScroll: true,
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        const documentIndex = this.documents.findIndex(
          (doc) => doc.documentId === documentId
        );
        if (documentIndex !== -1) {
          this.documents.splice(documentIndex, 1);
        }

        const index = this.documentIds.findIndex((id) => id === documentId);
        if (index !== -1) {
          this.documentIds.splice(index, 1);
        }

        this.documentService.deleteDocument(documentId).subscribe();
      },
    });
  }

  // ==================== UTILITY METHODS ====================

  setInitials(doc: DoctorDetail | null): string {
    if (!doc) return '';
    const first = doc.firstName?.[0] ?? '';
    const last = doc.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || 'DR';
  }

  getActiveClinic(): Clinic | undefined {
    const doctorData = this.doctor();
    if (!doctorData?.clinics || !this.clinicId) return undefined;
    return doctorData.clinics.find(
      (clinic) => clinic.clinicId === this.clinicId
    );
  }

  maskMobile(mobile: string | undefined): string {
    if (!mobile) return '';
    return mobile.replace(/(\d{4})\d{4}(\d{2})/, '$1XXXX$2');
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  // ==================== FORM VALIDATION HELPERS ====================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldErrors(fieldName: string): string[] {
    const field = this.appointmentForm.get(fieldName);
    if (!field?.errors || !field.touched) return [];

    const errors: string[] = [];
    const errorMap: Record<string, string> = {
      required: `${fieldName.toUpperCase()}.ERROR.REQUIRED`,
      maxlength: `${fieldName.toUpperCase()}.ERROR.MAX_LENGTH`,
      pastDate: `${fieldName.toUpperCase()}.ERROR.PAST_DATE`,
      reasonForVisitRequired: 'APPOINTMENT.ERROR.REASON_FOR_VISIT_REQUIRED',
    };

    Object.keys(field.errors).forEach((errorKey) => {
      if (errorMap[errorKey]) {
        errors.push(errorMap[errorKey]);
      }
    });

    return errors;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ==================== DATE/TIME FORMATTING ====================

  formatAppointmentDate(dateTime: string): string {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatAppointmentTime(dateTime: string): string {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // ==================== ACCESSIBILITY ====================

  getSlotAriaLabel(slot: Slot, timeOfDay: string, date: string): string {
    const status = slot.booked ? 'selected' : 'available';
    return `${timeOfDay} slot at ${slot.time} on ${date}, ${status}`;
  }

  getTabAriaLabel(dateEntry: DateEntry): string {
    const count = this.getSlotCount(dateEntry);
    const slotsText = count === 1 ? 'slot' : 'slots';
    return `${dateEntry.dayName} ${dateEntry.displayDate}, ${count} ${slotsText} available`;
  }

  onTabKeyDown(event: KeyboardEvent, index: number): void {
    console.warn(event.key);

    if (event.key === 'Enter' || event.key === ' ') {
      this.dateChange(index);
      event.preventDefault();
    }
  }

  // ==================== TRACKING FUNCTIONS ====================

  trackByDate(index: number, dateEntry: DateEntry): string {
    return dateEntry.date;
  }

  trackBySlot(index: number, slot: Slot): string {
    return `${slot.time}-${slot.booked}`;
  }

  trackByClinic(index: number, clinic: Clinic): string {
    return clinic.clinicId;
  }

  // ==================== ERROR HANDLING ====================

  private handleError(error: unknown, context: string): void {
    console.error(`${context}:`, error);

    let message = 'An unexpected error occurred';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'error' in error) {
      const maybeHttpError = error as { error?: { message?: string } };
      message = maybeHttpError.error?.message ?? message;
    }

    this.notificationService.showError(message, context);
  }

  handleComponentFailure(): void {
    this.loadingState.set(LoadingState.ERROR);
    this.notificationService.showError(
      'Component failed to load properly. Please refresh the page.',
      'System Error'
    );
  }

  // ==================== RESET FUNCTIONALITY ====================

  resetAllSelections(): void {
    this.slotManager.clearSlotSelection();
    this.appointmentForm.get('startDateTime')?.setValue(null);
    this.appointmentForm.get('endDateTime')?.setValue(null);
    this.previousTab = 0;
    this.dateChange(0);
  }

  scrollToFirstAvailableSlot(): void {
    const dates = this.dates();
    for (let i = 0; i < dates.length; i++) {
      if (this.getSlotCount(dates[i]) > 0) {
        this.dateChange(i);
        this.scrollToTab(i);
        break;
      }
    }
  }

  clearRFVSearch(): void {
    this.rfv_autoComplete.inputEL.nativeElement.value = '';
  }

  dateChange(index: number): void {
    console.warn('called {}', index);
    this.activeTab = index;

    const lastAppt = this.patientLastAppointmentDate();
    if (!lastAppt) {
      return;
    }

    const selectedDate = this.dates()?.[index];
    const doctor = this.doctor();
    const charges = doctor?.consultationCharge;

    if (
      !charges?.existingPatientValidityDays ||
      !charges?.existingPatient ||
      !selectedDate
    ) {
      return;
    }
    const diff = this.dateTimeUtil.getDaysBetween(lastAppt, selectedDate.date);
    const charge =
      diff > charges.existingPatientValidityDays
        ? charges.newPatient
        : charges.existingPatient;

    const type = this.appointmentForm.get('appointmentType')?.value;
    const fee =
      type === 'IN_PERSON' ? charge?.inPersonAmount : charge?.videoCallAmount;

    this.consultationFee.set(fee ?? 0);
  }
}
