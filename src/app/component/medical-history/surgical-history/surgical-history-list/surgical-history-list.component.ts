import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '@service/platform.service';
import { SurgicalHistoryService } from '@service/surgical-history.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SurgicalHistoryAddEditComponent } from "../surgical-history-add-edit/surgical-history-add-edit.component";
import { SurgicalHistoryInterface } from '@interface/surgical-history.interface';
import { PaginationResponse } from '@interface/api-response.interface';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-surgical-history-list',
  imports: [
    ButtonModule,
    DividerModule,
    TranslateModule,
    SurgicalHistoryAddEditComponent,
    CommonModule,
    TableModule,
    TooltipModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './surgical-history-list.component.html',
})
export class SurgicalHistoryListComponent implements OnInit {
  surgicalHistoryId;
  visible = false;
  patientId = input.required<string>();
  appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  surgicalHistory: SurgicalHistoryInterface[];
  first = 0;
  totalRecords = 0;
  size = 5;
  isBrowser = false;
  showLoader = true;
  actions = true;
  optionsItems = [
    {
      label: 'Edit',
      icon: 'pi pi-pen-to-square',
    }
  ];
  readonly signOff = input.required<number>();

  @ViewChild('surgicalHistoryTable') surgicalHistoryTable: Table;

  private readonly surgicalHistoryService = inject(SurgicalHistoryService);
  private readonly platformService = inject(PlatformService);
  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
  }

  addSurgicalHistory(): void {
    this.visible = true;
    this.surgicalHistoryId = null;
  }

  editSurgicalHistory(surgicalHistoryId: string): void {
    this.surgicalHistoryId = surgicalHistoryId;
    this.visible = true;
  }

  loadSurgicalHistory($event: TableLazyLoadEvent): void {
    if (!this.isBrowser) return;

    this.showLoader = true;
    const page = Math.floor($event.first / $event.rows);

    let params = new HttpParams()
      .append('source', 'PATIENT_APP')
      .append('page', page)
      .append('size', $event.rows)
      .append('sort', 'surgeryDate desc');

    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }

    this.surgicalHistoryService.getAllSurgicalHistory<PaginationResponse<SurgicalHistoryInterface>>(this.patientId(), params).subscribe({
      next: (data: PaginationResponse<SurgicalHistoryInterface>) => {
        this.surgicalHistory = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.surgicalHistory = [];
        this.showLoader = false;
      }
    });
  }
}
