import { AfterViewInit, Component, effect, inject, OnDestroy, OnInit, Renderer2, Signal, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '@service/appointment.service';
import { CommunicationService } from '@service/communication.service';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { DocumentService } from '@service/document.service';
import { LocalStorageService } from '@service/local-storage.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { ScrollSpyService } from '@service/scroll-spy.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Menu, MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { ClinicalSummaryComponent } from './clinical-summary/clinical-summary.component';
import { ClinicProfileData, DoctorProfileData } from '@interface/clinical-summary.interface';
import { NotificationService } from '@service/notification.service';
import { Divider } from "primeng/divider";

@Component({
  selector: 'app-patient-tab',
  imports: [
    ToolbarModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    ClinicalSummaryComponent,
    MenuModule,
    AvatarModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    TranslateModule,
    TooltipModule,
    Divider
  ],
  templateUrl: './patient-tab.component.html',
  styleUrl: './patient-tab.component.scss'
})
export class PatientTabComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly platformService = inject(PlatformService);
  private readonly spyService = inject(ScrollSpyService);
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly documentService = inject(DocumentService);
  private readonly _appointmentService = inject(AppointmentService);
  private readonly communicationService = inject(CommunicationService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dateTimeService = inject(DateTimeUtilityService);
  private readonly notificationService = inject(NotificationService);

  modules: MenuItem[] = [];
  private scrollSpySubscription?: Subscription;

  private menuItems: HTMLElement[] = [];

  @ViewChild('menu', { static: true }) menu: Menu;

  isBrowser = false;
  patientId = this.localStorageService.getPatientId();

  // selectedAppointment: string;
  blobUrl: string | null = null;
  doctorInitials = '';
  isPatientUpdated: Signal<boolean>;
  items: {
    label: string;
    value: string;
    icon: string;
    key: string;
  }[] = [
      { label: 'Medical History', value: 'medicalHistory', icon: 'pi pi-fw pi-plus', key: 'MEDICAL_HISTORY_LIST' },
      { label: 'Vitals', value: 'vitals', icon: 'pi pi-fw pi-plus', key: 'VITAL_LIST' },
      { label: 'Current Diagnosis', value: 'diagnosis', icon: 'pi pi-fw pi-plus', key: 'CURRENT_DIAGNOSIS_LIST' },
      { label: 'Allergy', value: 'allergy', icon: 'pi pi-fw pi-plus', key: 'ALLERGY_LIST' },
      { label: 'Medication', value: 'medication', icon: 'pi pi-fw pi-plus', key: 'MEDICATION_PATIENT_LIST' },
      { label: 'Lab', value: 'lab', icon: 'pi pi-fw pi-plus', key: 'LAB_RADIOLOGY_LIST' },
      { label: 'Immunization', value: 'immunization', icon: 'pi pi-fw pi-plus', key: 'IMMUNIZATION_PATIENT_LIST' },
      { label: 'Care Plan', value: 'careplan', icon: 'pi pi-fw pi-plus', key: 'CARE_PLAN_PATIENT_LIST' },
      { label: 'Document', value: 'document', icon: 'pi pi-fw pi-plus', key: 'DOCUMENT_LIST' },
    ]
  allowedItems: {
    label: string;
    value: string;
    icon: string;
    key: string;
  }[] = [];

  signOff: number | null = undefined;

  clinicProfile: ClinicProfileData;
  doctorProfile: DoctorProfileData;
  appointmentId;
  loading = false;
  constructor(

  ) {
    this.isBrowser = this.platformService.isBrowser();
    this.isPatientUpdated = this.patientService.isPatientUpdated;
    effect(() => {
      if (this.isPatientUpdated()) {
        this.patientService.isPatientUpdated.set(false)
      }
    })

  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.items.forEach(section => {
      this.allowedItems.push(section);
    });

    this.initMenu();
    this.setupScrollSpy();
  }


  ngAfterViewInit(): void {
    if (this.isBrowser) {
      queueMicrotask(() => this.initializePage());
    }
    this.communicationService.get<{ isReloadAppointment: boolean }>('reloadAppointment').subscribe(data => {
      if (data?.isReloadAppointment) {
        this.communicationService.clear('reloadAppointment');
      }
    });

  }

  ngOnDestroy(): void {
    this.scrollSpySubscription?.unsubscribe();
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    this.communicationService.unsubscribe();
  }

  private initializePage() {
    this.cacheMenuItems();
    const firstItem = this.modules?.[1]?.items?.[0]?.['value'];
    if (firstItem) this.highlightMenuItem(firstItem);
  }

  cancel(): void {
    this.router.navigateByUrl('/home/dashboard');
  }

  private initMenu(): void {
    this.modules = [
      { separator: true },
      {
        label: 'Clinical Summary',
        items: this.allowedItems
      }
    ];
  }

  getProfilePic(): void {
    const params = new HttpParams()
      .set('objectId', this.doctorProfile?.doctorId)
      .set('moduleId', 4)
      .set('subModuleId', 4);

    this.documentService.getThumbnail(params).subscribe({
      next: (blob: Blob) => {
        if (blob?.size) {
          this.blobUrl = URL.createObjectURL(blob);
        } else {
          this.setInitials();
        }
      },
      error: () => {
        this.setInitials();
      }
    }
    );
  }

  setInitials(): void {
    if (this.doctorProfile?.firstName || this.doctorProfile?.lastName) {
      const firstInitial = this.doctorProfile?.firstName?.charAt(0) || '';
      const lastInitial = this.doctorProfile?.lastName?.charAt(0) || '';
      this.doctorInitials = (firstInitial + lastInitial).toUpperCase();
    } else {
      this.doctorInitials = '?';
    }
  }

  scrollTo(sectionId: string): void {
    if (this.isBrowser) {
      const element = this.renderer.selectRootElement(`#${sectionId}`, true);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightMenuItem(sectionId);
    }
  }

  private setupScrollSpy(): void {
    if (!this.isBrowser) return;

    this.scrollSpySubscription = this.spyService.activeModule$
      .pipe(distinctUntilChanged())
      .subscribe(section => this.highlightMenuItem(section));
  }

  private highlightMenuItem(sectionId: string): void {
    if (!this.menuItems?.length) return;

    this.menuItems.forEach(item => this.renderer.removeClass(item, 'p-focus'));

    const activeItem = this.menuItems.find(item => item.getAttribute('data-section') === sectionId);
    if (activeItem) {
      this.renderer.addClass(activeItem, 'p-focus');
    }
  }

  private cacheMenuItems(): void {
    if (!this.isBrowser || !this.menu?.el?.nativeElement) return;
    const menuList = this.menu?.el?.nativeElement?.querySelector('.p-menu-list');
    if (menuList) {
      this.renderer.addClass(menuList, 'overflow-y-auto');
      this.renderer.addClass(menuList, 'flex-1');
    }
    const items = this.menu.el.nativeElement.querySelectorAll('#patient-menu .p-menu-item-link');
    this.menuItems = Array.from(items);
  }

  getChartingTooltip(): string {
    if (this.signOff === null || this.signOff === 0) {
      return 'CHARTING.START_VISIT';
    }
    if (this.signOff === 1) {
      return 'CHARTING.VIEW_VISIT';
    }
    return '';
  }

  generateVisitReport(patientId: string, appointmentId: string): void {
    if (!patientId || !appointmentId) {
      this.notificationService.showWarning("Select appointment first.")
      return;
    }
    this.loading = true;
    const params = new HttpParams()
      .set('patient', patientId)
      .set('appointment', appointmentId)
      .set('source', 'PATIENT_APP');

    this._appointmentService.generateVisitReport(params).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating visit report:', error);
        this.loading = false;
      }
    });
  }

  doctorProfileChange(event: DoctorProfileData): void {
    this.doctorProfile = event;
    this.getProfilePic();
    this.setInitials();
  }
  maskMobile(mobile: string | undefined): string {
    if (!mobile) return '';
    return mobile.replace(/(\d{4})\d{4}(\d{2})/, '$1XXXX$2');
  }
}