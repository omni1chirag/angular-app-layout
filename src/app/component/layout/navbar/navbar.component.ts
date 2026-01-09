import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationComponent } from "@component/notification/notification/notification.component";
import { APP_ROUTES } from '@constants/app.constants';
import { environment } from '@environment/environment';
import { LabelValue } from '@interface/common.interface';
import { PatientMapping } from '@interface/patient-profile.interface';
import { Clinic, Doctor, MappedClinic, MappedDoctor, MappedSpeciality, SearchResponse, SearchResult, SearchResultType, Speciality } from '@interface/search.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardStateService } from '@service/dashboard-state.service';
import { DoctorService } from '@service/doctor.service';
import { KeycloakService } from '@service/keycloak.service';
import { LayoutService } from '@service/layout.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { NotificationListService } from '@service/notification-list.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { UserService } from '@service/user.service';
import { UtilityService } from '@service/utility.service';
import { ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,
    StyleClassModule,
    DrawerModule,
    PanelMenuModule,
    ButtonModule,
    DividerModule,
    SelectButtonModule,
    FormsModule,
    CommonModule,
    TranslateModule,
    MenuModule,
    SelectModule,
    ChipModule,
    ConfirmDialogModule, NotificationComponent, InputGroupModule, InputGroupAddonModule, AvatarModule],
  providers: [ConfirmationService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {

  public readonly layoutService = inject(LayoutService);
  private readonly platformService = inject(PlatformService);
  private readonly userService = inject(UserService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly _router = inject(Router);
  private readonly doctorService = inject(DoctorService);
  private readonly masterService = inject(MasterService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly notificationListService = inject(NotificationListService);
  private readonly utilityService = inject(UtilityService);
  private readonly patientService = inject(PatientService);
  private readonly dashboardStateService = inject(DashboardStateService);

  @ViewChild('searchWrapper') searchWrapper!: ElementRef;

  city!: string
  locationOptions: LabelValue<string>[] = [];
  searchQuery = '';

  showDropdown = false;
  showNoResults = false;
  hasResultsFlag = false;
  activeTab = 'all';

  private debounceTimer?: number;
  readonly host = environment.host;

  searchResults: {
    doctors: SearchResult<Doctor>;
    clinics: SearchResult<Clinic>;
    specialities: SearchResult<Speciality>;
  } = this.getEmptyResults();

  mappedResults: {
    doctors: MappedDoctor[];
    clinics: MappedClinic[];
    specialities: MappedSpeciality[];
  } = this.getEmptyMapped();

  readonly tabs = [
    { key: 'all', label: 'All' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'clinics', label: 'Clinics' },
    { key: 'specialities', label: 'Specialities' },
  ];

  visibleProfile = false;
  isBrowser = false;
  preferredClinicId
  userClinics: string[] = [];
  selectedItem;

  activePatientProfile
  patientProfiles = signal<PatientMapping[]>([]);
  userId;
  notificationCount = signal<number>(0);
  isAdminUser = true;
  keyCloakUserId: string;
  notificationRefresh = signal<boolean>(false);
  isMamberAdded: Signal<boolean>;
  patientId = signal<string>(null);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
    if (!this.isBrowser) return;
    this.city = 'AHMEDABAD';
    this.notificationRefresh = this.notificationListService?.notificationRefresh;
    this.isMamberAdded = this.userService.isMemberAdded;
    this.patientId.set(this.localStorageService.getPatientId());

    effect(() => {
      if (this.isMamberAdded()) {
        this.loadUserProfilesFromServer();
        this.userService.isMemberAdded.set(false);
      }
    });

    effect(() => {
      if (this.notificationRefresh()) {
        this.getNotificationCounts();
        this.notificationRefresh.set(false);
      }
    });

    effect(() => {
      if (this.patientId()) {
        this.patientService.getCityByPatientId<string>(this.patientId()).subscribe({
          next: (data) => {
            data = null;
            this.city = data ?? 'AHMEDABAD';
          }
        })
      }
    })
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.searchWrapper && !this.searchWrapper.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  onInputFocus(): void {
    if (this.hasResultsFlag || this.showNoResults) {
      this.showDropdown = true;
    }
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.isAdminUser = this.utilityService?.isAdminUser() ?? true;
    this.keyCloakUserId = this.keycloakService.userId;
    if (!this.isAdminUser) {
      this.getNotificationCounts();
    }
    const userProfile = this.localStorageService.getItem('userProfile');
    if (userProfile) {
      this.userId = userProfile['userId']
    }
    this.loadUserProfilesFromLocalStorage();

    this.loadMasterData();
  }

  loadMasterData(): void {
    this.masterService.getStatesAndCities<LabelValue<string>[]>().subscribe({
      next: (data) => {
        this.locationOptions = data;
      }
    })
  }

  loadUserProfilesFromServer(): void {
    this.userService.getUserProfiles<PatientMapping[]>().subscribe({
      next: (data) => {
        this.setActiveProfile(data);
      },
      error: (error) => {
        console.error('Error fetching user profiles:', error);
      }
    });
  }

  loadUserProfilesFromLocalStorage(): void {
    const patientProfiles = this.localStorageService.getItem<PatientMapping[]>('patientProfiles');
    this.setActiveProfile(patientProfiles);
  }


  private setActiveProfile(patientProfiles) {
    if (!patientProfiles?.length) return;
    this.patientProfiles.set(patientProfiles);
    this.localStorageService.setItem('patientProfiles', patientProfiles);

    const savedPatientId = this.localStorageService.getItem('activePatientProfile');

    if (savedPatientId && patientProfiles.find(p => p.patientId === savedPatientId)) {
      this.activePatientProfile = savedPatientId;
    } else {
      this.activePatientProfile = this.patientProfiles()[0].patientId;
      this.localStorageService.setItem('activePatientProfile', this.activePatientProfile);
      this.userService.updateActivePatientProfile(this.userId, { 'patientId': this.activePatientProfile })
        .subscribe({
          next: () => {
            if (this.keycloakService.isAuthenticated()) {
              this.keycloakService.updateToken(-1).then(() => {
                this.userService.isProfileChanged.set(true);
              });
            }
          }
        });
    }
  }

  patientChange($event: DropdownChangeEvent): void {
    const priviousPatientProfile = localStorage.getItem('activePatientProfile');
    this.confirmationService.confirm({
      header: 'Confirm',
      message: 'Are you sure that you want to change Profile?',
      key: 'profile-change',
      rejectVisible: true,
      acceptVisible: true,
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Yes',
      },
      accept: async () => {
        if (this.userId) {
          this.userService.updateActivePatientProfile(this.userId, { patientId: this.activePatientProfile })
            .subscribe({
              next: () => {
                localStorage.setItem('activePatientProfile', $event.value);
                this.patientId.set($event.value);
                if (this.keycloakService.isAuthenticated()) {
                  this.keycloakService.updateToken(-1).then((flag) => {
                    if (flag) {
                      this._router.navigate([APP_ROUTES.DASHBOARD]);
                    }
                  });
                }
                this.dashboardStateService.triggerReload(true);
                this.userService.isProfileChanged.set(true);
              },
              error: () => {
                this.activePatientProfile = priviousPatientProfile;
              }
            });

        }
      },
      reject: () => {
        this.activePatientProfile = priviousPatientProfile;
      }
    });
  }



  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  navigateToDashboard(): void {
    this.navigateTo(localStorage.getItem('dashboardRoute'));
  }

  getNotificationCounts(): void {
    if (this.keyCloakUserId) {
      this.notificationListService.getNotificationCounts<{ counts: number }>(this.keyCloakUserId).subscribe({
        next: (data) => {
          this.notificationCount.set(data?.counts ?? 0);
        }
      })
    }
  }

  getTabClasses(tabKey: string): Record<string, boolean> {
    return {
      'text-blue-600': this.activeTab === tabKey,
      'border-blue-600': this.activeTab === tabKey,
      'text-gray-600': this.activeTab !== tabKey,
      'border-transparent': this.activeTab !== tabKey,
      'hover:text-blue-600': true,
      'hover:border-blue-600': true,
    };
  }

  resetResults(): void {
    this.searchResults = this.getEmptyResults();
    this.mappedResults = this.getEmptyMapped();
    this.hasResultsFlag = false;
    this.showNoResults = false;
    this.showDropdown = false;
  }

  private debounce(fn: () => void, delay: number): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(fn, delay);
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim();

    if (!query || query.length < 3) {
      this.resetResults();
      return;
    }

    this.debounce(() => {
      const params = new HttpParams().set('q', query).set('city', this.city);

      this.doctorService.search<SearchResponse>(params).subscribe({
        next: (data) => {
          this.activeTab = 'all';
          this.searchResults = data || this.getEmptyResults();

          this.mappedResults = {
            doctors: this.mapDoctors(this.searchResults.doctors),
            clinics: this.mapClinics(this.searchResults.clinics),
            specialities: this.mapSpecialities(this.searchResults.specialities),
          };

          this.hasResultsFlag = this.getAllResults().length > 0;
          this.showNoResults = !this.hasResultsFlag;
          this.showDropdown = true;
        },
        error: () => {
          this.resetResults();
          this.showNoResults = true;
          this.showDropdown = true;
        },
      });
    }, 300);
  }

  mapDoctors(docs: SearchResult<Doctor>): MappedDoctor[] {
    return docs?.items?.map(doc => ({
      type: 'doctor',
      id: doc.doctorId,
      name: doc.fullName,
      category: doc.specialitiesText,
      city: doc.city,
      fee: doc.consultationFee,
      mode: doc.consultationMode.join(', '),
      firstName: doc.firstName,
      lastName: doc.lastName,
      imageUrl: `${this.host}/document-api/documents/thumbnail?objectId=${doc.doctorId}&moduleId=4&subModuleId=4`,
      imageError: false,
      consultationCharges: doc.consultationCharges
    })) ?? [];
  }

  mapClinics(clinics: SearchResult<Clinic>): MappedClinic[] {
    return clinics?.items?.map(clinic => ({
      type: 'clinic',
      id: clinic.clinicId,
      name: clinic.clinicName,
      avatar: '/assets/images/clinic.png',
      location: clinic.city,
      doctorsCount: clinic.doctorsCount,
      imageUrl: `${this.host}/document-api/documents/thumbnail?objectId=${clinic.clinicId}&moduleId=10&subModuleId=15`,
      imageError: false
    })) ?? [];
  }

  mapSpecialities(specs: SearchResult<Speciality>): MappedSpeciality[] {
    return specs?.items?.map(spec => ({
      type: 'speciality',
      id: spec.specialityId,
      name: spec.name,
      doctorsCount: spec.doctorsCount,
      icon: 'pi pi-heart-fill',
      iconColor: 'text-red-500'
    })) ?? [];
  }

  getDoctorResults(): MappedDoctor[] { return this.mappedResults.doctors; }
  getClinicResults(): MappedClinic[] { return this.mappedResults.clinics; }
  getSpecialityResults(): MappedSpeciality[] { return this.mappedResults.specialities; }

  getAllResults(): SearchResultType[] { return [...this.getDoctorResults(), ...this.getClinicResults(), ...this.getSpecialityResults()]; }


  getFilteredResults(): SearchResultType[] {
    switch (this.activeTab) {
      case 'doctors': return this.getDoctorResults();
      case 'clinics': return this.getClinicResults();
      case 'specialities': return this.getSpecialityResults();
      case 'all': return this.getAllResults();
      default: return [];
    }
  }

  getTabCount(key: string): number {
    switch (key) {
      case 'doctors': return this.searchResults.doctors.totalCount;
      case 'clinics': return this.searchResults.clinics.totalCount;
      case 'specialities': return this.searchResults.specialities.totalCount;
      case 'all': return (
        this.searchResults.doctors.totalCount +
        this.searchResults.clinics.totalCount +
        this.searchResults.specialities.totalCount
      );
      default: return 0;
    }
  }



  private getEmptyResults() {
    return {
      doctors: { items: [], totalCount: 0 },
      clinics: { items: [], totalCount: 0 },
      specialities: { items: [], totalCount: 0 },
    };
  }

  private getEmptyMapped() {
    return {
      doctors: [],
      clinics: [],
      specialities: [],
    };
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.resetResults();
  }

  selectItem(item: SearchResultType): void {
    this.searchQuery = item.name;
    this.showNoResults = false;
    item.city = this.city;

    if (!item?.type || !item?.id) return;

    this.localStorageService.setItem('selectedSearchItem', JSON.stringify(item));

    let targetUrl;
    switch (item.type) {
      case 'doctor':
        targetUrl = `/home/doctor/${item.id}`;
        break;
      case 'clinic':
        targetUrl = `/home/clinic/${item.id}/doctors`;
        break;
      case 'speciality':
        targetUrl = `/home/speciality/${item.id}/doctors`;
        break;
      default:
        console.warn('Unknown type:', item['type']);
        return;
    }
    this.showDropdown = false;
    this.navigateTo(targetUrl);
  }

  onViewAllClick(url: string): void {
    this.localStorageService.removeItem('selectedSearchItem');
    this.navigateTo(url, { query: this.searchQuery, city: this.city });
    this.showDropdown = false;
  }

  setInitials(doc: MappedDoctor): string {
    return `${doc.firstName?.[0] ?? ''}${doc.lastName?.[0] ?? ''}`.toUpperCase();
  }

  trackByDoctor(_: number, doctor: MappedDoctor): string {
    return doctor.id;
  }

  trackBySpeciality(index: number, spec: MappedSpeciality): string | number {
    return spec.name || index; // Use name as a unique identifier since id isn't available
  }

  navigateTo(path: string, queryParams?: { query: string, city: string }): void {
    this._router.navigate(path.split('/').filter(Boolean), {
      queryParams,
      replaceUrl: true
    });
  }

  getDoctorImage(doctorId: string): string {
    return `${this.host}/document-api/documents/thumbnail?objectId=${doctorId}&moduleId=4&subModuleId=4`;
  }

  getClinicImage(clinicId: string): string {
    return `${this.host}/document-api/documents/thumbnail?objectId=${clinicId}&moduleId=10&subModuleId=15`;
  }

  onInputBlur(): void {
    setTimeout(() => {
      if (!this.searchWrapper.nativeElement.contains(document.activeElement)) {
        this.showDropdown = false;
      }
    }, 200);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
