import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '@service/appointment.service';
import { DocumentService } from '@service/document.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { ScrollSpyService } from '@service/scroll-spy.service';
import { UtilityService } from '@service/utility.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-menu',
  imports: [MenuModule, AvatarModule, ButtonModule, CommonModule, SelectModule, FormsModule],
  templateUrl: './patient-menu.component.html',
  styleUrl: './patient-menu.component.scss'
})
export class PatientMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  modules: MenuItem[] = [];
  private scrollSpySubscription?: Subscription;
  private menuItems: HTMLElement[] = [];
  @ViewChild('menu', { static: true }) menu: any;

  isBrowser = false;
  patientId!: string;
  patientInfo: any;
  appointmentList: any[] = [];
  selectedAppointment: any;
  isClinicSummary = false;
  blobUrl: string | null = null;
  patientInitials: string = '';

  constructor(
    private platformService: PlatformService,
    private spyService: ScrollSpyService,
    private patientService: PatientService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private utilityService: UtilityService,
    private documentService: DocumentService,
    private appointmentService: AppointmentService
  ) {
    this.isBrowser = platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const { url, params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    this.isClinicSummary = url.some(x => x.path === 'summary');

    this.getPatientBasicInfo();
    this.initMenu();
    this.setupScrollSpy();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      queueMicrotask(() => this.initializePage());
    }
  }

  ngOnDestroy(): void {
    this.scrollSpySubscription?.unsubscribe();
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
  }

  changePage(pageName: string): void {
    this.router.navigate([pageName], { relativeTo: this.activatedRoute }).then(() => {
      this.initMenu();
      this.initializePage()
      setTimeout(() => this.initializePage(), 100);
    });
  }

  private initializePage() {
    this.cacheMenuItems();
    const firstItem = this.modules?.[1]?.items?.[0]?.['value'];
    if (firstItem) this.highlightMenuItem(firstItem);
  }

  cancel() {
    this.router.navigateByUrl('/home/patient/list');
  }

  private initMenu(): void {
    this.activatedRoute.children.forEach(route => {
      const { url } = route.snapshot;
      this.isClinicSummary = url.some(x => x.path === 'summary');
    });

    this.modules = this.isClinicSummary ? [
      { separator: true },
      {
        label: 'Clinical Summary',
        items: [
          { label: 'Medication', value: 'medication', icon: 'pi pi-fw pi-plus' },
          { label: 'Allergy', value: 'allergy', icon: 'pi pi-fw pi-plus' },
          { label: 'Lab', value: 'lab', icon: 'pi pi-fw pi-plus' },
          { label: 'Current Diagnosis', value: 'diagnosis', icon: 'pi pi-fw pi-plus' },
          { label: 'Immunization', value: 'immunization', icon: 'pi pi-fw pi-plus' },
          { label: 'Document', value: 'document', icon: 'pi pi-fw pi-plus' },
          { label: 'Vitals', value: 'vitals', icon: 'pi pi-fw pi-plus' }
        ]
      }
    ] : [
      { separator: true },
      {
        label: 'Patient Profile',
        items: [
          { label: 'Profile Detail', value: 'profile' },
          { label: 'Insurance', value: 'insurance' }
        ]
      }
    ];
  }

  getPatientBasicInfo(): void {
    this.patientService.getPatientBasicInfo(this.patientId).subscribe({
      next: ({ data }) => {
        this.patientInfo = data;

        const dob = new Date(this.patientInfo.dateOfBirth);
        this.patientInfo.dateOfBirth = `${dob.getDate().toString().padStart(2, '0')}-${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob.getFullYear()}`;
        this.patientInfo.age = this.utilityService.convertDateToAgePSP(dob);

        this.getAppointmentLabels();
        this.getProfilePic();
      },
      error: () => this.cancel()
    });
  }

  getAppointmentLabels(): void {
    const clinicId = localStorage.getItem('currentlyUsedClinic');
    if (!clinicId) return;

    const params = new HttpParams()
      .set('patientId', this.patientId)
      .set('clinicId', clinicId);

    this.appointmentService.getAppointmentLabels(params).subscribe((resp: any) => {
      this.appointmentList = resp.data;
    });
  }


  getProfilePic(): void {
    const params = new HttpParams()
      .set('objectId', this.patientId)
      .set('moduleId', 2)
      .set('subModuleId', 2);

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
      }}
    );
  }

  setInitials(): void {
    if (this.patientInfo?.firstName || this.patientInfo?.lastName) {
      const firstInitial = this.patientInfo?.firstName?.charAt(0) || '';
      const lastInitial = this.patientInfo?.lastName?.charAt(0) || '';
      this.patientInitials = (firstInitial + lastInitial).toUpperCase();
    } else {
      this.patientInitials = '?';
    }
  }

  appointmentChange(event: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { appointmentId: event.value },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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

    const items = this.menu.el.nativeElement.querySelectorAll('#patient-menu .p-menu-item-link');
    this.menuItems = Array.from(items);
  }
}
