import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImmunizationService } from '@service/immunization.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ImmunizationList } from '@interface/immunization.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { PaginationResponse } from '@interface/api-response.interface';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-immunization-patient-list',
  imports: [
    TranslateModule,
    DividerModule,
    TableModule,
    ButtonModule,
    AutoCompleteModule,
    CommonModule,
    TagModule,
    TooltipModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './immunization-patient-list.component.html',
})
export class ImmunizationPatientListComponent implements OnInit {

  private readonly immunizationService = inject(ImmunizationService);
  private readonly masterService = inject(MasterService);
  private readonly platformService = inject(PlatformService);
  readonly localStorageService = inject(LocalStorageService);

  visible = false;
  immunizationList: ImmunizationList[] = [];
  vaccineSuggestions: LabelValue<string>[] = [];
  frequentlyUsedVaccines: LabelValue<string>[] = [];
  doseNumberOptions: LabelValue<string>[] = [];
  routeOptions: LabelValue<string>[] = [];
  siteOptions: LabelValue<string>[] = [];
  statusOptions: LabelValue<number>[] = [];
  isBrowser = false;
  readonly appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  readonly patientId = this.localStorageService.getPatientId();
  immunizationName = signal<string>(undefined);
  immunizationId = signal<string>(undefined);
  showLoader = true;
  first = 0;
  totalRecords = 0;
  size = 10;
  readonly signOff = input.required<number>();

  @ViewChild('immunizationTable') immunizationTable: Table;

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.getFrequentlyUsedVaccines();
    this.initializeMasterData();
  }

  loadImmunizations(event?: TableLazyLoadEvent): void {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;
    this.first = event?.first || 0;
    this.size = event?.rows || 10;

    let params = new HttpParams();
    params = params.append('page', Math.floor(this.first / this.size));
    params = params.append('size', this.size);
    params = params.append('sort', 'dateOfVaccination asc');
    params = params.append('sort', 'status asc');

    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }

    const apiCall = this.immunizationService.getPatientImmunizations(this.patientId, params);

    apiCall.subscribe({
      next: (data: PaginationResponse<ImmunizationList>) => {
        this.immunizationList = data?.content;
        this.totalRecords = data?.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.showLoader = false;
      }
    });

  }

  initializeMasterData(): void {

    const params = ['IMMUNIZATION_DOSE', 'IMMUNIZATION_SITE', 'IMMUNIZATION_ROUTES', 'IMMUNIZATION_STATUS'];

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        switch (res.name) {
          case 'IMMUNIZATION_DOSE':
            this.doseNumberOptions = res.value as LabelValue<string>[];
            break;
          case 'IMMUNIZATION_SITE':
            this.siteOptions = res.value as LabelValue<string>[];
            break;
          case 'IMMUNIZATION_ROUTES':
            this.routeOptions = res.value as LabelValue<string>[];
            break;
          case 'IMMUNIZATION_STATUS':
            this.statusOptions = res.value as LabelValue<number>[];
            break;
          default:
            console.warn('name not found', res.name);
            break;
        }
      });
    });
  }

  getFrequentlyUsedVaccines(): void {
    this.immunizationService.getAllFrequentlyUsedVaccines().subscribe({
      next: (data: LabelValue<string>[]) => {
        this.frequentlyUsedVaccines = data || [];
      },
      error: (error) => {
        console.error('Error fetching frequently used vaccines:', error);
      },
    });
  }

  addImmunization(vaccineObj: LabelValue<string>): void {
    this.visible = true;
    this.immunizationId.set(null);
    this.immunizationName.set(vaccineObj?.value);
  }

  getDoseNumber(dose: string): string {
    const doseObj = this.doseNumberOptions.find((item) => item.value === dose);
    return doseObj ? doseObj.label : '';
  }

  getRoute(route: string): string {
    const routeObj = this.routeOptions.find((item) => item.value === route);
    return routeObj ? routeObj.label : '';
  }

  getSite(site: string): string {
    const siteObj = this.siteOptions.find((item) => item.value === site);
    return siteObj ? siteObj.label : '';
  }

  getStatus(status: number): string {
    const statusObj = this.statusOptions.find((item) => item.value === status);
    return statusObj ? statusObj.label : '';
  }

  getTagSeverity(status: number | string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (+status) {
      case 1:
        return 'success';
      case 2:
        return 'secondary';
      case 3:
        return 'danger';
      case 4:
        return 'warn';
      default:
        return null;
    }
  }

}
