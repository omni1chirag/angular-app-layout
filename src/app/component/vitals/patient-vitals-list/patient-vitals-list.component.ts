import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from "primeng/divider";
import { PatientVitalsAddEditComponent } from "../patient-vitals-add-edit/patient-vitals-add-edit.component";
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PatientVitalService } from '@service/patient-vital.service';
import { PlatformService } from '@service/platform.service';
import { LocalStorageService } from '@service/local-storage.service';
import { DocumentService } from '@service/document.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PatientVitalList } from '@interface/vital-interface';
import { HttpParams } from '@angular/common/http';
import { PaginationResponse } from '@interface/api-response.interface';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { UtilityService } from '@service/utility.service';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';

@Component({
  selector: 'app-patient-vitals-list',
  imports: [ToolbarModule,
    ButtonModule,
    PatientVitalsAddEditComponent,
    CommonModule,
    TableModule,
    TranslateModule,
    MenuModule,
    DividerModule,
    TooltipModule,
    PageHeaderDirective, TableAutoScrollDirective],
  templateUrl: './patient-vitals-list.component.html',
})
export class PatientVitalsListComponent implements OnInit {
  private readonly patientVitalService = inject(PatientVitalService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly documentService = inject(DocumentService);
  readonly utilityService = inject(UtilityService);

  @ViewChild('vitalTable')
  vitalTable: Table;

  visible = false;
  settingsVisible = false;
  patientId = signal<string | undefined>(undefined);
  appointmentId = input<string>(null);
  readonly signOff = input<number>();
  readonly isModifiable = input<boolean>(true);
  first = 0;
  totalRecords = 0;
  size = 10;
  showLoader = true;
  vitals: PatientVitalList[];
  isBrowser: boolean;
  actions = true;
  optionsItems = [
    {
      label: 'EDIT ',
      icon: 'pi pi-pen-to-square',
    },
    {
      label: 'DELETE',
      icon: 'pi pi-trash'
    }
  ];
  vitalsId;
  groupCollapsedState: Record<string, boolean> = {};

  toggleGroup(date: string): void {
    this.groupCollapsedState[date] = !this.groupCollapsedState[date];
  }

  private ref: DynamicDialogRef | undefined;
  private readonly dialogService = inject(DialogService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
  }

  addVitals(): void {
    this.visible = true;
    this.vitalsId = undefined;
  }

  editVital(vitalsId?: string): void {
    this.vitalsId = vitalsId;
    this.visible = true;
  }

  deleteVital(vitalsId: string): void {
    const patientId = this.localStorageService.getPatientId();
    this.patientVitalService.deleteVital(patientId, vitalsId).subscribe({
      next: () => {
        this.clear();
      }
    });
  }

  clear(): void {
    this.vitalTable.clear();
  }


  loadVitals($event: TableLazyLoadEvent): void {
    if (!this.isBrowser || !$event) return;
    const page = Math.floor($event.first / $event.rows);
    let params = new HttpParams()
      .set('size', $event.rows)
      .set('page', page)
      .set('source', 'PATIENT_APP');

    if (this.appointmentId()) {
      params = params.append('appointment', this.appointmentId());
    }

    const filter = $event.filters as Record<string, { value: unknown }>;
    params = this.utilityService.setTableWhereClause(filter, params);
    ([{ field: $event.sortField || 'recordedDate', order: $event.sortOrder || 1 }])?.forEach((sort) => {
      const field = sort.field;
      const order = sort.order;
      params = params.append('sort', `${field} ${order === 1 ? 'desc' : 'asc'}`);
    });
    this.showLoader = true;
    const patientId = this.localStorageService.getPatientId();
    this.patientId.set(patientId);
    this.patientVitalService.getAllVitalsList<PaginationResponse<PatientVitalList>>(patientId, params).subscribe({
      next: (data: PaginationResponse<PatientVitalList>) => {
        this.vitals = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: () => {
        this.vitals = [];
        this.showLoader = false;
      }
    });
  }

  viewDocument(documentId: string): void {
    if (!documentId) return;
    this.documentService.getFile(documentId).subscribe(async (blob: Blob) => {
      const isImage = blob.type.startsWith('image/');
      const url = URL.createObjectURL(blob);
      if (isImage) {
        const component = await import('@component/common/document-viewer/document-viewer.component');
        this.ref = this.dialogService.open(component.DocumentViewerComponent, {
          width: '95vw',
          height: '95vh',
          modal: true,
          inputValues: {
            url: url,
            documentId: documentId,
            title: 'Document'
          }
        })
        this.ref.onClose.subscribe(() => {
          URL.revokeObjectURL(url);
        });

        return;
      }
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.location.href = url;
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      }
    })
  }

}
