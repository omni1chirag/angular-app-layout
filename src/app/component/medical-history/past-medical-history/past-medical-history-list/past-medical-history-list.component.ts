import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PastMedicalHistoryService } from '@service/past-medical-history.service';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { PastMedicalHistoryAddEditComponent } from "../past-medical-history-add-edit/past-medical-history-add-edit.component";
import { PastHistoryInterface } from '@interface/past-history.interface';
import { PaginationResponse } from '@interface/api-response.interface';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-past-medical-history-list',
  imports: [DividerModule,
    ButtonModule,
    TranslateModule,
    PastMedicalHistoryAddEditComponent,
    CommonModule,
    TableModule,
    TooltipModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './past-medical-history-list.component.html',
})
export class PastMedicalHistoryListComponent implements OnInit {

  private readonly localStorageService = inject(LocalStorageService);
  readonly platformService = inject(PlatformService);
  readonly pastMedicalHistoryService = inject(PastMedicalHistoryService);
  readonly router = inject(Router);
  
  pastMedicalHistoryId;
  visible = false;
  readonly patientId = this.localStorageService.getPatientId();
  appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  pastHistory: PastHistoryInterface[];
  first = 0;
  totalRecords = 0;
  size = 5;

  isBrowser = false;
  showLoader = true;
  optionsItems = [
    {
      label: 'Edit',
      icon: 'pi pi-pen-to-square',
    }
  ];
  readonly signOff = input.required<number>();

  @ViewChild('pastHistoryTable') pastHistoryTable: Table;



  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
  }

  addHistory(): void {
    this.visible = true;
    this.pastMedicalHistoryId = null;
  }

  editPastHistory(pastMedicalHistoryId?: string): void {
    this.pastMedicalHistoryId = pastMedicalHistoryId;
    this.visible = true;
  }

  loadpastHistory($event: TableLazyLoadEvent): void {
    if (!this.isBrowser) return;

    this.showLoader = true;
    const page = Math.floor($event.first / $event.rows);

    let params = new HttpParams()
      .append('source', 'PATIENT_APP')
      .append('page', page)
      .append('size', $event.rows)
      .append('sort', 'diagnosisDate desc');

    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }

    this.pastMedicalHistoryService.getAllpastHistory<PaginationResponse<PastHistoryInterface>>(this.patientId, params).subscribe({
      next: (data: PaginationResponse<PastHistoryInterface>) => {
        this.pastHistory = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.pastHistory = [];
        this.showLoader = false;
      }
    });
  }

}
