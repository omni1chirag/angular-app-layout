import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { environment } from '@environment/environment';
import { DoctorService } from '@service/doctor.service';
import { LocalStorageService } from '@service/local-storage.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ScrollerModule } from 'primeng/scroller';
import { Skeleton } from 'primeng/skeleton';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Toolbar } from "primeng/toolbar";
import { DataView } from "primeng/dataview";
import { LazyLoadEvent } from 'primeng/api';
import { ApiResponse, PaginationResponse } from '@interface/api-response.interface';
import { ClinicList } from '@interface/search.interface';

@Component({
  selector: 'app-clinic-list',
  imports: [CommonModule, CardModule, PageHeaderDirective, ButtonModule, AvatarModule, FormsModule,
    ReactiveFormsModule, ScrollerModule, Skeleton, Toolbar, DataView],
  templateUrl: './clinic-list.component.html',
  styleUrl: './clinic-list.component.scss'
})
export class ClinicListComponent implements OnInit, OnDestroy{

  private readonly platformService = inject(PlatformService);
  private readonly router = inject(Router);
  private readonly doctorService = inject(DoctorService);
  private readonly route = inject(ActivatedRoute);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly notificationService = inject(NotificationService);


  private readonly destroy$ = new Subject<void>();
  readonly isBrowser = this.platformService.isBrowser();
  readonly host = environment.host;

  get clinicList(): ClinicList[] {
    return this.clinics();
  }

  clinics = signal<ClinicList[]>([]);

  totalRecords = 0;
  currentPage = signal(0);
  pageSize = signal(15);
  isLoading = false;
  layout: "list" | "grid" = 'grid';

  searchQuery = '';
  city = '';

  readonly first = computed(() => this.currentPage() * this.pageSize());
  readonly rows = computed(() => this.pageSize);

  getClinicRows(clinics: ClinicList[]): ClinicList[][] {
    const rows: ClinicList[][] = [];
    for (let i = 0; i < clinics.length; i += 2) {
      rows.push(clinics.slice(i, i + 3));
    }
    return rows;
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;


    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['query'];
        this.city = params['city'];
        if (params['query'] && params['city']) {
          this.loadClinics();
        }
      });
  }


  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByClinicId(clinic: ClinicList): string {
    return clinic.clinicId;
  }

  goToClinicDoctors(clinic: ClinicList): void {
    this.localStorageService.setItem('selectedSearchItem', JSON.stringify({
      type: "clinic", doctorsCount: clinic?.doctorsCount, id: clinic?.clinicId, 'city': this.city
    }));
    this.router.navigateByUrl(`/home/clinic/${clinic.clinicId}/doctors`);
  }

  onPageChange(event: LazyLoadEvent): void {
    const rows = event.rows ?? 15;
    const firstIndex = event.first ?? 0;

    // calculate page index manually
    this.currentPage.set(Math.floor(firstIndex / rows));
    this.pageSize.set(rows);
    this.loadClinics();
  }

  private loadClinics(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    let params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('size', this.pageSize().toString());

    // Add search parameters
    if (this.searchQuery && this.city) {
      params = params.set('q', this.searchQuery).set('city', this.city);
    }

    const request$ = this.doctorService.searchClinicsByQuery<ApiResponse<PaginationResponse<ClinicList>>>(params);

    request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: ApiResponse<PaginationResponse<ClinicList>>) => {
          const clinicList = res.data.content.map(clinic => ({
            ...clinic,
            imageUrl: `${this.host}/document-api/documents/thumbnail?objectId=${clinic.clinicId}&moduleId=10&subModuleId=15`,
            imageError: false
          }));
          this.clinics.set(clinicList || []);
          this.totalRecords = res.data?.totalElements || 0;
        },
        error: ({ error }: { error: ApiResponse<unknown> }) => {
          this.clinics.set([]);
          this.totalRecords = 0;
          this.notificationService.showError(
            error?.message || 'Failed to load doctors.'
          );
        }
      });
  }


}
