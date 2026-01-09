import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { PaginationResponse } from '@interface/api-response.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { Diagnosis } from '@interface/diagnosis.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DiagnosisService } from '@service/diagnosis.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-diagnosis-list',
  imports: [TranslateModule,
    DividerModule,
    AutoCompleteModule,
    ButtonModule,
    CommonModule,
    TableModule,
    TagModule,
    TooltipModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './diagnosis-list.component.html'
})

export class DiagnosisListComponent implements OnInit {

  private readonly diagnosisService = inject(DiagnosisService);
  private readonly masterService = inject(MasterService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);

  @ViewChild('DiagnosisTable') DiagnosisTable: Table

  visible = false;
  diagnosisId = signal<string>(null);
  diagnosisName = signal<string>(null);
  diagnosisSuggestion: LabelValue<string>[] = [];
  frequentlyUsedDiagnosis: LabelValue<string>[] = []
  diagnosisList: Diagnosis[] = [];
  statusOptions: LabelValue<number>[] = [];
  isBrowser = false;
  readonly appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  readonly patientId = this.localStorageService.getPatientId();
  showLoader = true;
  first = 0;
  totalRecords = 0;
  size = 10;
  readonly signOff = input.required<number>();

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
    if (!this.isBrowser) return;

    this.initializeMasterData();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
  }

  loadDiagnosis(event?: TableLazyLoadEvent): void {

    if (!this.isBrowser) return;

    this.showLoader = true;
    this.first = event?.first || 0;
    this.size = event?.rows || 10;

    let params = new HttpParams();
    params = params.append('page', Math.floor(this.first / this.size));
    params = params.append('size', this.size);
    params = params.append('sort', 'status asc');
    params = params.append('sort', 'diagnosisName asc');

    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }
    const apiCall = this.diagnosisService.getAllDiagnosis(this.patientId, params);

    apiCall.subscribe({
      next: (data: PaginationResponse<Diagnosis>) => {
        this.diagnosisList = data?.content;
        this.totalRecords = data?.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
        console.error('Error fetching diagnosis list:', error);
      }
    });

  }

  initializeMasterData(): void {

    const params = ['DIAGNOSIS_STATUS'];

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name === 'DIAGNOSIS_STATUS') {
            this.statusOptions = res.value as LabelValue<number>[];
        } else {
            console.warn('name not found', res.name);
        }
      });
    });
    this.getAllFrequentlyUsedDiagnosis();
  }

  searchDiagnosis(searchParam: string): void {

    this.diagnosisService.searchDiagnosis(searchParam).subscribe({
      next: (data) => {
        if (data) {
          this.diagnosisSuggestion = data as LabelValue<string>[];
        } else {
          this.diagnosisSuggestion = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching diagnosis suggestions:', error);
      }
    });

  }

  getAllFrequentlyUsedDiagnosis(): void {
    this.diagnosisService.getAllFrequentlyUsedDiagnosis().subscribe({
      next: (data) => {
        this.frequentlyUsedDiagnosis = data as LabelValue<string>[];
      },
      error: (error) => {
        console.error('Error fetching frequently used diagnosis:', error);
      }
    });
  }

  addDiagnosis(diagnosisObj: LabelValue<string>): void {
    this.visible = true;
    this.diagnosisName.set(diagnosisObj?.value);
    this.diagnosisId.set(null);
  }

  editDiagnosis(diagnosis: Diagnosis): void {
    this.visible = true;
    this.diagnosisId.set(diagnosis?.diagnosisId);
    this.diagnosisName.set(null);
  }

  removeDiagnosis(index: number, item?: Diagnosis): void {
    this.diagnosisList.splice(index, 1);
    this.deleteDiagnosis(item.diagnosisId);
  }

  deleteDiagnosis(diagnosisId: string): void {

    this.diagnosisService.deleteDiagnosis(this.patientId, diagnosisId).subscribe({
      next: () => {
        this.loadDiagnosis();
      },
      error: (error) => {
        console.error('Error deleting diagnosis:', error);
      }
    });
  }

  getStatus(status: number): string {
    const statusObj = this.statusOptions.find((item) => item.value == status);
    return statusObj ? statusObj.label : '';
  }

  getTagSeverity(status: number | string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (status) {
      case 1:  // Active
        return 'success';
      case 2:  // Resolved
        return 'info';
      case 3:  // Chronic
        return 'secondary';
      case 4:  // Recurring
        return 'warn';
      case 5:  // In Remission
        return 'info';
      case 6:  // Worsening
        return 'warn';
      case 7:  // Improving
        return 'success';
      case 8:  // Unknown
        return 'contrast';
      case 9:  // Complicated
        return 'danger';
      case 10: // Unstable
        return 'danger';
      case 11: // Inactive
        return 'secondary';
      case 12: // Ruled Out
        return 'info';
      case 13: // Undiagnosed
        return 'contrast';
      default:
        return null;
    }
  }

}
