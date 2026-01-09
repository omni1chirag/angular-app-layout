import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { PaginationResponse } from '@interface/api-response.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { ImmunizationList } from '@interface/immunization.interface';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '@service/appointment.service';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { ImmunizationService } from '@service/immunization.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-immunization-list',
  imports: [
    TranslateModule,
    DividerModule,
    FormsModule,
    AutoCompleteModule,
    TableModule,
    ButtonModule,
    CommonModule,
    TagModule,
    TooltipModule,
    ToolbarModule,
    PageHeaderDirective,
    ToggleButtonModule,
    TableAutoScrollDirective,
    DatePickerModule,
    SelectModule,
    ...GLOBAL_CONFIG_IMPORTS,
    MultiSelectModule
  ],
  templateUrl: './immunization-list.component.html',
})
export class ImmunizationListComponent implements OnInit {
  private readonly immunizationService = inject(ImmunizationService);
  private readonly masterService = inject(MasterService);
  private readonly utilityService = inject(UtilityService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);

  visible = false;
  actions = false;
  isBrowser = false;
  showLoader = true;
  first = 0;
  totalRecords = 0;
  size = 50;

  immunizationList: ImmunizationList[] = [];
  vaccineSuggestions: LabelValue<string>[] = [];
  doseNumberOptions: LabelValue<string>[] = [];
  statusMap = new Map<string, string>();
  readonly tagSeverityMap = new Map<number, 'success' | 'secondary' | 'danger' | 'warn' | null>([
    [1, 'success'],
    [2, 'secondary'],
    [3, 'danger'],
    [4, 'warn'],
  ]);


  patientId = signal<string>(undefined);
  appointmentId = signal<string>(undefined);
  immunizationId = signal<string>(undefined);
  addWorkflow = false;
  loading = false;
  @ViewChild('immunizationTable') immunizationTable: Table;
  filterDate: string[] = []
  columnWidth = 200;
  clinicOptions: LabelValue<string>[] = [];
  doctorOptions: LabelValue<string>[] = [];

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
  }

  loadImmunizations($event?: TableLazyLoadEvent): void {
    if (!this.isBrowser) return;

    this.showLoader = true;
    const page = Math.floor($event.first / $event.rows);

    let params = new HttpParams()
      .append('page', page)
      .append('size', $event.rows)
    
    const patientId = this.localStorageService.getPatientId();
    params = params.append('patient', patientId);

    if (this.appointmentId()) {
      params = params.append('appointment', this.appointmentId());
    }

    // ---------------- DATE RANGE FIX ----------------
    if ($event?.filters?.['appointmentDate']) {
      const filterMeta = $event.filters['appointmentDate'];
      const filterObj = Array.isArray(filterMeta) ? filterMeta[0] : filterMeta;

      if (filterObj?.value) {
        let startDate: Date | string;
        let endDate: Date | string;

        if (!Array.isArray(filterObj.value)) {
          startDate = filterObj.value.startDate;
          endDate = filterObj.value.endDate;
        } else {
          startDate = filterObj.value[0];
          endDate = filterObj.value[1];
        }

        if (startDate && endDate) {
          const start = this.dateTimeUtilityService.combineDateAndTimeToString(startDate, '00:00');
          const end = this.dateTimeUtilityService.combineDateAndTimeToString(endDate, '23:59');

          params = params.append('appointmentStartDateTime', start);
          params = params.append('appointmentEndDateTime', end);
        }
      }
    }

    // REMOVE appointmentDate BEFORE passing filters to utility method
    const filters = { ...$event?.filters };
    delete filters['appointmentDate'];

    params = this.utilityService.setTableWhereClause(filters as Record<string, { value: unknown }>, params);

    const apiCall = this.immunizationService.getAllImmunizations(params);

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

    const params = ['IMMUNIZATION_DOSE', 'IMMUNIZATION_STATUS'];

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        switch (res.name) {
          case 'IMMUNIZATION_DOSE':
            this.doseNumberOptions = res.value as LabelValue<string>[];
            this.doseNumberOptions.push({ label: 'Other', value: 'Other' });
            break;
          case 'IMMUNIZATION_STATUS':
            this.statusMap = this.statusMap = new Map(
              res.value.map((item: LabelValue<string>) => [item.value, item.label])
            );
            break;
          default:
            console.warn('name not found', res.name);
            break;
        }
      });
    });
    const patientId = this.localStorageService.getPatientId();
    this.patientId.set(patientId);
    const requestParams = new HttpParams().append('patientId', patientId);
    this.appointmentService.getDoctorLabelsByPatientAppointments<LabelValue<string>[]>(requestParams).subscribe({
      next: (data) => {
        this.doctorOptions = data;
      }
    })
    this.appointmentService.getClinicLabelsByPatientAppointments<LabelValue<string>[]>(requestParams).subscribe({
      next: (data) => {
        this.clinicOptions = data;
      }
    })
  }

  searchVaccine(searchParam: string): void {

    this.immunizationService.searchVaccine(searchParam).subscribe({
      next: (data: LabelValue<string>[]) => {
        if (data) {
          const hasExactMatch = data.some(
            (item: LabelValue<string>) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.vaccineSuggestions = hasExactMatch
            ? data
            : [...data, { label: searchParam, value: searchParam }];
        } else {
          this.vaccineSuggestions = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching vaccine suggestions:', error);
      }
    });

  }

  onDateRangeSelect(dateRange: string[], filter: (value: unknown) => void): void {
    if (dateRange?.length === 2 && dateRange[0] && dateRange[1]) {
      filter({
        startDate: dateRange[0],
        endDate: dateRange[1]
      });
    }
  }

}
