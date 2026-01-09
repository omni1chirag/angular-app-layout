import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FamilyHistoryAddEditComponent } from "../family-history-add-edit/family-history-add-edit.component";
import { CommonModule } from '@angular/common';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { HttpParams } from '@angular/common/http';
import { FamilyHistoryService } from '@service/family-history.service';
import { PlatformService } from '@service/platform.service';
import { TooltipModule } from 'primeng/tooltip';
import { FamilyHistoryInterface } from '@interface/family-history.interface';
import { PaginationResponse } from '@interface/api-response.interface';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-family-history-list',
  imports: [ButtonModule,
    DividerModule,
    TranslateModule,
    FamilyHistoryAddEditComponent,
    CommonModule,
    TableModule,
    TooltipModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './family-history-list.component.html',
})
export class FamilyHistoryListComponent implements OnInit {

  private readonly platformService = inject(PlatformService);
  private readonly familyHistoryService = inject(FamilyHistoryService);
  private readonly localStorageService = inject(LocalStorageService);

  familyHistoryId;
  visible = false;
  patientId = this.localStorageService.getPatientId();
  appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  familyHistory: FamilyHistoryInterface[];
  first = 0;
  totalRecords = 0;
  size = 5;
  columnWidth = 70;
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
  @ViewChild('familyHistoryTable') familyHistoryTable: Table;



  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
  }

  addFamilyHistory(): void {
    this.visible = true;
    this.familyHistoryId = null;
  }

  editFamilyHistory(familyHistoryId: string): void {
    this.familyHistoryId = familyHistoryId;
    this.visible = true;
  }

  loadFamilyHistory(event: TableLazyLoadEvent): void {
    if (!this.isBrowser) return;

    this.showLoader = true;
    this.first = event?.first || 0;
    this.size = event?.rows || this.size || 5;

    let params = new HttpParams()
      .append('source', 'PATIENT_APP')
      .append('page', Math.floor(this.first / this.size))
      .append('size', this.size)
      .append('sort', 'age asc');

    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }

    this.familyHistoryService.getAllFamilyHistory<PaginationResponse<FamilyHistoryInterface>>(this.patientId, params).subscribe({
      next: (data: PaginationResponse<FamilyHistoryInterface>) => {
        this.familyHistory = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.familyHistory = [];
        this.showLoader = false;
      }
    });
  }

}
