import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@service/notification.service';
import { PatientService } from '@service/patient.service';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { AddEditAppointmentComponent } from "../../appointment/appointment-add-edit/appointment-add-edit.component";

@Component({
  selector: 'app-patient-list',
  imports: [TableModule,
    DividerModule,
    FormsModule,
    ButtonModule,
    ToolbarModule,
    MenuModule,
    CommonModule,
    TagModule,
    TranslateModule,
    SelectModule,
    PageHeaderDirective,
    TableAutoScrollDirective,
    AutoCompleteModule,
    InputNumberModule,
    ToggleButtonModule,
    InputMaskModule, AddEditAppointmentComponent],
  templateUrl: './patient-list.component.html',
  providers: [MessageService],
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent {

  isBrowser: boolean = false;
  showLoader = true;
  patients: any[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  patientSuggestions: Array<any> = []
  actions: boolean = false;

  optionsItems = [
    {
      label: 'EDIT',
      icon: 'pi pi-user-edit'
    },
    {
      label: 'CLINICAL_SUMMARY',
      icon: 'pi pi-file-edit'
    },
    {
      label: 'ADD_APPOINTMENT',
      icon: 'pi pi-calendar-plus'
    }
  ];
  isAppointmentVisible: any;
  selectedPatient: any;


  constructor(private messageService: MessageService,
    private patientService: PatientService,
    @Inject(PLATFORM_ID) private platformId: object,
    private notificationService: NotificationService,
    private _router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  clear(table: Table) {
    table.clear();
  }

  addEditMode(patientId?: any) {
    if (patientId) {
      this.navigateTo(`/home/patient/${patientId}/profile`);
    } else {
      this.navigateTo(`/home/patient/add`);
    }

  }

  navigageToSummary(patientId: any) {
    if (patientId) {
      this.navigateTo(`/home/patient/${patientId}/summary`);
    }
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  searchPatients($event: AutoCompleteCompleteEvent) {
    const query = $event.query;
    if (query && query.length > 2) {
      this.patientService.searchPatients(query).subscribe((resp: any) => {
        this.patientSuggestions = resp.data;
      });
    }
  }

  onMobileNumberEnter($event, filter) {
    let value = $event.target.value;
    if (value) {
      value = value.replaceAll("_", "").replaceAll(" ", "");
      if (value.length == 10) {
        filter(value);
      } else if (value.length == 0) {
        filter(undefined);
      }
    }
  }

  loadPatients($event) {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;
    let params = new HttpParams();
    const filter = $event.filters;
    if (filter) {
      if (filter.patient?.value) {
        params = params.append('patient', filter.patient.value);
      }
      if (filter.mobileNumber?.value) {
        params = params.append('mobileNumber', filter.mobileNumber.value);
      }
    }
    ([{ field: 'name', order: 1 }])?.forEach((sort) => {
      let field = sort.field;
      let order = sort.order;
      params = params.append('sort', (field + ' ' + (order == 1 ? 'asc' : 'desc')));
    });
    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows);
    this.patientService.getPatients(params).subscribe({
      next: (resp: any) => {
        this.patients = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
      }
    }
    );
  }

  addAppointment(patient: any) {
    const {patientId ,firstName,lastName } = patient;
    this.selectedPatient = {patientId ,firstName,lastName };
    this.isAppointmentVisible = true;
  }
}
