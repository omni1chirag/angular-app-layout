import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterService } from '@service/master.service';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { HttpParams } from '@angular/common/http';
import { PatientLabService } from '@service/patient-lab.service';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Lab } from '@interface/lab.interface';
import { LabelValue } from '@interface/common.interface';
import { PlatformService } from '@service/platform.service';
import { PaginationResponse } from '@interface/api-response.interface';
import { UtilityService } from '@service/utility.service';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-lab-list',
  imports: [ToolbarModule,
    ButtonModule,
    TableModule,
    CommonModule,
    SelectModule,
    FormsModule,
    MenuModule,
    PaginatorModule,
    TranslateModule,
    TooltipModule,
    AutoCompleteModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './patient-lab-list.component.html',
})
export class PatientLabListComponent implements OnInit {

  readonly platformService = inject(PlatformService);
  readonly masterService = inject(MasterService);
  readonly patientLabService = inject(PatientLabService);
  readonly utilityService = inject(UtilityService);
  readonly localStorageStory = inject(LocalStorageService);

  @ViewChild('labTable') dt: Table;
  readonly appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  readonly patientId = this.localStorageStory.getPatientId();
  lab: Lab[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 100;
  actions: boolean;
  isBrowser: boolean;
  showLoader = true;
  testName: LabelValue<string>[] = [];
  testTypes: LabelValue<string>[] = [];
  statuses: LabelValue<string>[] = [];
  visible: boolean;
  selectedLabId: string;
  optionsItems = [
    {
      label: 'Edit',
      icon: 'pi pi-pen-to-square',
    }
  ];
  readonly signOff = input.required<number>();
  selectedTestTypeForSearch: string | null = null;

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
  }

  initializeMasterData(): void {
    this.masterService.getTestType<LabelValue<string>[]>().subscribe((data: LabelValue<string>[] = []) => {
      this.testTypes = data;
    });

    this.masterService.getPatientLabStatus<LabelValue<string>[]>().subscribe((data: LabelValue<string>[] = []) => {
      this.statuses = data;
    });
  }

  addLab(): void {
    this.selectedLabId = null;
    this.visible = true;
  }
  editLab(selectedLabId: string): void {
    this.selectedLabId = selectedLabId;
    this.visible = true;
  }

  loadLabs($event: TableLazyLoadEvent): void {
    if (!this.isBrowser || !$event) return;

    const page = Math.floor($event.first / $event.rows);
    let params = new HttpParams()
      .set('size', $event.rows)
      .set('page', page);

    if (this.patientId) {
      params = params.set('patientId', this.patientId);
    }

    if (this.appointmentId()) {
      params = params.set('appointment', this.appointmentId());
    }

    // Use same filter handling pattern as loadDocuments
    const filter = $event.filters as Record<string, { value: unknown }>;
    params = this.utilityService.setTableWhereClause(filter, params);

    // Sorting logic
    ([{ field: $event.sortField || 'selectedLabId', order: $event.sortOrder || 1 }])?.forEach((sort) => {
      const field = sort.field;
      const order = sort.order;
      params = params.append('sort', `${field} ${order === 1 ? 'asc' : 'desc'}`);
    });

    this.showLoader = true;
    this.patientLabService.getAllLabs<PaginationResponse<Lab>>(this.patientId, params).subscribe({
      next: (data: PaginationResponse<Lab>) => {
        this.lab = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.showLoader = false;
      }
    });
  }


  searchTestNames(event: AutoCompleteCompleteEvent): void {
    const query = event.query;
    if (query && query.length > 2 && this.selectedTestTypeForSearch) {
      this.patientLabService.getLabTestNames<LabelValue<string>[]>(query, this.selectedTestTypeForSearch)
        .subscribe((data: LabelValue<string>[] = []) => {
          this.testName = data;
        });
    }
  }

  onTestTypeChange(selectedType: string): void {
    this.selectedTestTypeForSearch = selectedType;
  }

}
