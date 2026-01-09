import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { CarePlanService } from '@service/care-plan.service';
import { HttpParams } from '@angular/common/http';
import { MasterService } from '@service/master.service';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { DiagnosisService } from '@service/diagnosis.service';
import { SelectModule } from 'primeng/select';
import { PaginationResponse } from '@interface/api-response.interface';
import { PatientCarePlanList } from '@interface/careplan.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-care-plan-patient-list',
  imports: [
    DividerModule,
    TableModule,
    ButtonModule,
    TranslateModule,
    TooltipModule,
    CommonModule,
    TagModule,
    AutoCompleteModule,
    FormsModule,
    SelectModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './care-plan-patient-list.component.html'
})
export class CarePlanPatientListComponent implements OnInit {

  private readonly utilityService = inject(UtilityService);
  private readonly carePlanService = inject(CarePlanService);
  private readonly platformService = inject(PlatformService);
  private readonly masterService = inject(MasterService);
  private readonly diagnosisService = inject(DiagnosisService);
  private readonly localStorageService = inject(LocalStorageService);

  readonly patientId = this.localStorageService.getPatientId();
  readonly appointmentId = input.required<string>();
  readonly signOff = input.required<number>();
  readonly isModifiable = input.required<boolean>();

  isCarePlanVisible = false;
  isDailyReadingVisible = false;

  carePlanId;
  isBrowser = false;
  carePlanList: PatientCarePlanList[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  showLoader = true;
  carePlanSuggestions: LabelValue<string>[] = [];
  diagnosisSuggestion: LabelValue<string>[] = [];
  statuses: LabelValue<number>[] = [];

  statusMap = new Map<number, string>();
  readonly tagSeverityMap = new Map<number, 'success' | 'info' | 'warn' | 'danger' | null>([
    [1, 'success'],
    [2, 'warn'],
    [3, 'info'],
    [0, 'danger']
  ]);

  @ViewChild('carePlanTable')
  carePlanTable: Table;

  constructor(

  ) {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
  }

  initializeMasterData(): void {
    const params = ['CARE_PLAN_STATUS'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name === 'CARE_PLAN_STATUS') {
          this.statuses = [{ label: 'All', value: 4 }, ...res.value] as LabelValue<number>[];
          this.statusMap = new Map(
            res.value.map((item: LabelValue<number>) => [item.value, item.label])
          );
        } else {
          console.warn('name not found', res.name);
        }
      })

    });
  }

  addEditCarePlan(carePlanId?: string): void {
    this.isCarePlanVisible = true;
    this.carePlanId = carePlanId;
  }

  addReading(carePlanId: string): void {
    this.isDailyReadingVisible = true;
    this.carePlanId = carePlanId;
  }

  loadCarePlans($event?: TableLazyLoadEvent): void {
    if (!this.isBrowser) return;

    this.showLoader = true;
    const page = Math.floor($event.first / $event.rows);

    let params = new HttpParams()
      .append('page', page)
      .append('size', $event.rows)
      .append('sort', 'startDate desc');
    const filter = $event.filters as Record<string, { value: unknown }>;

    params = this.utilityService.setTableWhereClause(filter, params)

    if (this.appointmentId()) {
      params = params.append('appointment', this.appointmentId());
    }
    if (params.get('status') == '4') {
      params = params.delete('status')
    }


    const apiCall = this.carePlanService.getAllPatientCarePlan<PaginationResponse<PatientCarePlanList>>(this.patientId, params);

    apiCall.subscribe({
      next: (data) => {
        this.carePlanList = data?.content;
        this.totalRecords = data?.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.showLoader = false;
      }
    });
  }

  searchCarePlans($event: AutoCompleteCompleteEvent): void {
    const query = $event.query;
    if (query && query.length > 2) {
      this.carePlanService.searchPatientCarePlans<LabelValue<string>[]>(this.patientId, query).subscribe((data) => {
        this.carePlanSuggestions = data;
      });
    }
  }

  searchDiagnoses($event: AutoCompleteCompleteEvent): void {
    const query = $event.query;
    this.diagnosisService.searchDiagnosis<LabelValue<string>[]>(query).subscribe({
      next: (data) => {
        if (data?.length > 0) {
          this.diagnosisSuggestion = data;
        } else {
          this.diagnosisSuggestion = [{ label: query, value: query }];
        }
      },
      error: (error) => {
        console.error('Error fetching diagnosis suggestions:', error);
      }
    });
  }

}
