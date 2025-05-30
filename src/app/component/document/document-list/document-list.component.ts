import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '@service/document.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import dayjs from 'dayjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DocumentAddEditComponent } from "../document-add-edit/document-add-edit.component";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';

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
    TranslateModule],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent implements OnInit {

  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();

  isDocumentVisible = false;
  documentId;
  documents: Array<any> = [];
  documentSuggestions: Array<any> = [];
  documentTypes: Array<any> = [];
  isBrowser: boolean = false;
  showLoader: boolean = true;
  first = 0;
  totalRecords = 0;
  size = 10;

  constructor(
    private platformService: PlatformService,
    private masterService: MasterService,
    private documentService: DocumentService
  ) {
    this.isBrowser = platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
  }

  initializeMasterData() {
    this.masterService.getDocumentTypes().subscribe((resp: any) => {
      if (resp && resp.data) {
        this.documentTypes = resp.data;
      }
    });
  }

  searchDocuments($event: AutoCompleteCompleteEvent) {
    const query = $event.query;
    if (query && query.length > 2) {
      this.documentService.searchDocuments(this.patientId(), query).subscribe((resp: any) => {
        this.documentSuggestions = resp.data;
      });
    }
  }

  loadDocuments($event) {
    if (!this.isBrowser) return;

    const page = Math.floor($event.first / $event.rows);
    let params = new HttpParams()
      .set('patient', this.patientId())
      .set('page', page)
      .set('size', $event.rows);

    const appointmentId = this.appointmentId();
    if (appointmentId) {
      params = params.set('appointment', appointmentId);
    }

    const filters = $event.filters ?? {} as Record<string, { value: any }>;
    Object.keys(filters)?.forEach((key) => {
      if (filters[key].value != undefined && filters[key].value !== null && filters[key].value !== '') {
        params = params.append(key, key == 'docDate' ? this.onUploadDateChange(filters[key].value) : filters[key].value);
      }
    });

    ([{ field: 'docTitle', order: 1 }])?.forEach((sort) => {
      let field = sort.field;
      let order = sort.order;
      params = params.append('sort', (field + ' ' + (order == 1 ? 'asc' : 'desc')));
    });
    this.showLoader = true;
    this.documentService.getDocuments(params).subscribe({
      next: (resp: any) => {
        this.documents = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
      }
    })
  }

  addEditDocument(documentId?) {
    this.documentId = documentId;
    this.isDocumentVisible = true;
  }

  viewDocument(documentId: any) {
    this.documentService.viewDocument(documentId);
  }

  onUploadDateChange($event: Date | string) {
    const formattedDate = dayjs($event).format('YYYY-MM-DD');
    return formattedDate;
  }
}