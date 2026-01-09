import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationResponse } from '@interface/api-response.interface';
import { LabelValue } from '@interface/common.interface';
import { DocumentListResponse } from '@interface/document.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '@service/document.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import dayjs from 'dayjs';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { Table, TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentAddEditComponent } from "../document-add-edit/document-add-edit.component";
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-document-list',
  imports: [DividerModule,
    CommonModule,
    TableModule,
    DocumentAddEditComponent,
    DatePickerModule,
    SelectModule,
    FormsModule,
    ButtonModule,
    AutoCompleteModule,
    TooltipModule,
    TranslateModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent implements OnInit {

  readonly platformService = inject(PlatformService);
  readonly masterService = inject(MasterService);
  readonly documentService = inject(DocumentService);
  readonly utilityService = inject(UtilityService);
  readonly localStorageService = inject(LocalStorageService);

  readonly appointmentId = input.required<string>();
  readonly patientId = this.localStorageService.getPatientId();
  readonly isModifiable = input.required<boolean>();

  isDocumentVisible = false;
  documentId!: string | null;
  documents: DocumentListResponse[] = [];
  documentSuggestions: LabelValue<string>[] = [];
  documentTypes: LabelValue<number>[] = [];
  isBrowser = false;
  showLoader = true;
  first = 0;
  totalRecords = 0;
  size = 10;
  readonly signOff = input.required<number>();
  @ViewChild('documentTable') documentTable: Table;



  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
  }

  initializeMasterData(): void {
    this.masterService.getDocumentTypes<LabelValue<number>[]>().subscribe((data: LabelValue<number>[] = []) => {
      this.documentTypes = data;

    });
  }

  searchDocuments($event: AutoCompleteCompleteEvent): void {
    const query = $event.query;
    if (query && query.length > 2) {
      const params = new HttpParams()
      .append('patient', this.patientId)
      .append('appointment', this.appointmentId())
      .append('name', query);

      this.documentService.searchDocuments<LabelValue<string>[]>(params).subscribe((data: LabelValue<string>[] = []) => {
        this.documentSuggestions = data;
      });
    }
  }

  loadDocuments($event: TableLazyLoadEvent): void {
    if (!this.isBrowser || !$event) return;

    const page = Math.floor($event.first / $event.rows);
    let params = new HttpParams()
      .set('patient', this.patientId)
      .set('page', page)
      .set('size', $event.rows)
      .set('source', 'PATIENT_APP');

    const appointmentId = this.appointmentId();
    if (appointmentId) {
      params = params.set('appointment', appointmentId);
    }
    const filter = $event.filters as Record<string, { value: unknown }>;
    params = this.utilityService.setTableWhereClause(filter, params);

    ([{ field: 'docTitle', order: 1 }])?.forEach((sort) => {
      const field = sort.field;
      const order = sort.order;
      params = params.append('sort', (field + ' ' + (order == 1 ? 'asc' : 'desc')));
    });
    this.showLoader = true;
    this.documentService.getDocuments<PaginationResponse<DocumentListResponse>>(params).subscribe({
      next: (data: PaginationResponse<DocumentListResponse>) => {
        this.documents = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.showLoader = false;
      }
    })
  }

  addEditDocument(documentId: string | null): void {
    this.documentId = documentId;
    this.isDocumentVisible = true;
  }

  viewDocument(documentId: string): void {
    this.documentService.viewDocument(documentId);
  }

  onUploadDateChange($event: Date | string): string {
    const formattedDate = dayjs($event).format('YYYY-MM-DD');
    return formattedDate;
  }
}