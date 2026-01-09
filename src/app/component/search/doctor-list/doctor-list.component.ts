import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { environment } from '@environment/environment';
import { ApiResponse, PaginationResponse } from '@interface/api-response.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { DoctorList, MappedClinic, MappedSpeciality } from '@interface/search.interface';
import { DoctorService } from '@service/doctor.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { LazyLoadEvent } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DataView } from 'primeng/dataview';
import { FloatLabel } from "primeng/floatlabel";
import { Select } from 'primeng/select';
import { Skeleton } from "primeng/skeleton";
import { Toolbar } from "primeng/toolbar";
import { debounceTime, distinctUntilChanged, finalize, map, merge, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-doctor-list',
  imports: [CommonModule,
    CardModule,
    Select,
    ButtonModule,
    AvatarModule,
    FormsModule,
    ReactiveFormsModule,
    FloatLabel,
    ChipModule,
    Skeleton,
    DataView, PageHeaderDirective, Toolbar],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss',
})
export class DoctorListComponent implements OnInit, OnDestroy {



  // Injected services
  private readonly platformService = inject(PlatformService);
  private readonly router = inject(Router);
  private readonly doctorService = inject(DoctorService);
  private readonly masterService = inject(MasterService);
  private readonly route = inject(ActivatedRoute);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();
  readonly isBrowser = this.platformService.isBrowser();
  readonly host = environment.host;

  get doctorList(): DoctorList[] {
    return this.doctors();
  }

  doctors = signal<DoctorList[]>([]);

  totalRecords = 0;
  currentPage = signal(0);
  pageSize = signal(15);
  isLoading = false;
  layout: "list" | "grid" = 'grid'; // 'grid' or 'list'

  // Search and filter properties
  searchQuery = '';
  city = '';
  id = '';

  // Master data
  genders: LabelValue<string>[] = [];
  experienceLevels: LabelValue<string>[] = [];
  fees: LabelValue<string>[] = [];
  availability: LabelValue<string>[] = [];
  consultTypes: LabelValue<string>[] = [];
  sortOptions: LabelValue<string>[] = [];

  // Form
  filterForm = this.fb.group({
    gender: [null as string | null],
    experience: [null as string | null],
    fee: [null as string | null],
    availability: [null as string | null],
    consultType: [null as string | null],
    sortBy: ['relevance']
  });

  // Computed values
  readonly first = computed(() => this.currentPage() * this.pageSize());
  readonly rows = computed(() => this.pageSize);

  constructor() {
    if (!this.isBrowser) return;

    this.initializeMasterData();
    this.setupFilterSubscription();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.setupRouteSubscription();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.destroy$.next();
    this.destroy$.complete();
    this.localStorageService.removeItem('selectedSearchItem');
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadDoctors();
      });
  }

  private setupRouteSubscription(): void {
    merge(
      this.route.paramMap.pipe(
        map(params => ({
          id: params.get('id'),
          query: null,
          city: null
        }))
      ),
      this.route.queryParamMap.pipe(
        map(qp => ({
          id: null,
          query: qp.get('query'),
          city: qp.get('city')
        }))
      )
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id, query, city }) => {
        if (id) {
          this.id = id;
          this.searchQuery = '';
          this.city = '';
          this.currentPage.set(0);
          this.loadDoctors();
        } else if (query && city) {
          this.searchQuery = query;
          this.city = city;
          this.id = '';
          this.currentPage.set(0);
          this.loadDoctors();
        }
      });
  }

  onPageChange(event: LazyLoadEvent): void {
    const rows = event.rows ?? 15;
    const firstIndex = event.first ?? 0;

    // calculate page index manually
    this.currentPage.set(Math.floor(firstIndex / rows));
    this.pageSize.set(rows);
    this.loadDoctors();
  }

  onFilterClear(): void {
    this.filterForm.patchValue({
      gender: null,
      experience: null,
      fee: null,
      availability: null,
      consultType: null,
      sortBy: 'relevance'
    });
  }

  private loadDoctors(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const filters = this.filterForm.value;
    const selectedSearchItem = this.getSelectedSearchItem();

    let params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('size', this.pageSize().toString());

    // Add city parameter
    if (selectedSearchItem?.city) {
      params = params.set('city', selectedSearchItem.city);
    }

    // Add search parameters
    if (this.searchQuery && this.city) {
      params = params.set('q', this.searchQuery).set('city', this.city);
    }

    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    const request$ = this.getSearchRequest<ApiResponse<PaginationResponse<DoctorList>>>(selectedSearchItem, params);

    request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: ApiResponse<PaginationResponse<DoctorList>>) => {
          const doctorList = res.data.content.map(doctor => ({
            ...doctor,
            imageUrl: `${this.host}/document-api/documents/thumbnail?objectId=${doctor.doctorId}&moduleId=4&subModuleId=4`,
            imageError: false
          }));
          this.doctors.set(doctorList || []);
          this.totalRecords = res.data?.totalElements || 0;
        },
        error: ({ error }: { error: ApiResponse<unknown> }) => {
          this.doctors.set([]);
          this.totalRecords = 0;
          this.notificationService.showError(
            error?.message || 'Failed to load doctors.'
          );
        }
      });
  }

  private getSelectedSearchItem(): MappedClinic | MappedSpeciality {
    return this.localStorageService.hasKey('selectedSearchItem')
      ? JSON.parse(this.localStorageService.getItem('selectedSearchItem') || '{}')
      : null;
  }

  private getSearchRequest<T>(selectedSearchItem: MappedClinic | MappedSpeciality, params: HttpParams): Observable<T> {
    if (selectedSearchItem?.type === 'clinic') {
      return this.doctorService.findDoctorsByClinic(this.id, params);
    } else if (selectedSearchItem?.type === 'speciality') {
      return this.doctorService.findDoctorsBySpeciality(this.id, params);
    } else {
      return this.doctorService.searchDoctorsByQuery(params);
    }
  }

  private initializeMasterData(): void {
    const params = ['EXPERIENCE', 'FEES', 'AVAILABILITY', 'SORT_OPTIONS', 'CONSULT_TYPE', 'GENDER'];

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.processMasterData(data);
        },
        error: (error) => {
          console.error('Failed to load master data:', error);
        }
      });
  }

  private processMasterData(data: CommonMaster<unknown>[]): void {
    data.forEach(res => {
      switch (res.name) {
        case 'EXPERIENCE':
          this.experienceLevels = res.value as LabelValue<string>[];
          break;
        case 'FEES':
          this.fees = res.value as LabelValue<string>[];
          break;
        case 'AVAILABILITY':
          this.availability = res.value as LabelValue<string>[];
          break;
        case 'SORT_OPTIONS':
          this.sortOptions = res.value as LabelValue<string>[];
          break;
        case 'CONSULT_TYPE':
          this.consultTypes = res.value as LabelValue<string>[];
          break;
        case 'GENDER':
          this.genders = res.value as LabelValue<string>[];
          break;
      }
    });
  }

  // Utility methods
  setInitials(doc: DoctorList): string {
    const first = doc.firstName?.[0] ?? '';
    const last = doc.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  trackByDoctorId(index: number, doctor: DoctorList): string {
    return doctor.doctorId;
  }

  goToDoctorDetail(doctor: DoctorList): void {
    const targetUrl = `/home/doctor/${doctor.doctorId}`;
    this.router.navigateByUrl(targetUrl);
  }
}

