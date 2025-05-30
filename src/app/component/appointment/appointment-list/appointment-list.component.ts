import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { AppointmentService } from '@service/appointment.service';
import { MasterService } from '@service/master.service';
import { UtilityService } from '@service/utility.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpParams } from '@angular/common/http';
import { PaginatorModule } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { PatientService } from '@service/patient.service';
import { TranslateModule } from '@ngx-translate/core';
import { AddEditAppointmentComponent } from "../appointment-add-edit/appointment-add-edit.component";

interface Appointment {
  appointmentId: string;
  patient: {
    patientId: number;
    fullName: string;
  };
  clinic: {
    clinicId: number;
    clinicName: string;
  };
  doctor: {
    doctorId: number;
    doctorName: string;
  };
  appointmentType: string;
  appointmentDateTime: Date;
  rfv: string;
  appointmentStatus: string;
}
interface LabelValue {
  label: string;
  value: any;
}


@Component({
  selector: 'app-appointment-list',
  imports: [TableModule,
    AutoCompleteModule,
    DividerModule,
    FormsModule,
    ButtonModule,
    ToggleButtonModule,
    ToolbarModule,
    MenuModule,
    CommonModule,
    TagModule,
    SelectModule,
    DividerModule,
    DatePickerModule,
    PageHeaderDirective,
    TableAutoScrollDirective,
    MultiSelectModule,
    PaginatorModule,
    SelectButtonModule,
    TooltipModule,
    TranslateModule, AddEditAppointmentComponent],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent {

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('appointmentTable') appointmentTable!: Table;

  organizationId: string;

  // Filter variables
  filterDate: Date[] = []

  optionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-check-circle'
        },
        {
          label: 'Cancel',
          icon: 'pi pi-times-circle'
        }
      ]
    }
  ];

  patientSuggestions: LabelValue[] = [];
  clinicOptions: LabelValue[] = [];
  doctorOptions: LabelValue[] = [];
  appointmentTypeOptions: LabelValue[] = [
    {
      "label": "In-Person",
      "value": "IN_PERSON"
    },
    {
      "label": "Virtual",
      "value": "VIRTUAL"
    }
  ];
  appointmentStatusOptions: LabelValue[] = [];
  providerList = null;//providerList
  rfvSuggestions: LabelValue[] = [];


  // Table variables
  appointments: Appointment[] = [];
  selectedAppointment: Appointment[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 150;
  showLoader = true;

  // frozen elements
  actions: boolean = true;
  isBrowser: boolean = false;
  isVisible: boolean = false;
  appointment: {
    appointmentId: string;
  };

  //store table events
  lazyLoadEvent: TableLazyLoadEvent | null = null;

  patientDetail;

  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }

  constructor(private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: object,
    private _router: Router,
    private appointmentService: AppointmentService,
    private masterService: MasterService,
    private utilityService: UtilityService,
    private patientService: PatientService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.organizationId = this.utilityService.getOrganizationId();
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.onResize();
    }
    if (history?.state?.patientId) {
      this.patientService.getPatient(history.state.patientId).subscribe((resp: any) => {
        this.patientDetail = resp.data;
        this.isVisible = true;
      })
    }
    this.initializeMasterData();
  }

  initializeMasterData() {
    const setClinics = (organizationId, firstLoad?) => {
      if (!organizationId) {
        this.clinicOptions = [];
        return;
      }
      this.appointmentService.getClinicLabels(organizationId).subscribe((resp: any) => {
        this.clinicOptions = resp.data;
        const clinics = this.clinicOptions.map(clinic => clinic.value);
        clinics && clinics.length > 0 &&
          this.loadDoctorsByClinic(clinics);
      })
    }
    setClinics(this.organizationId, true);

    const params = ['APPOINTMENT_STATUS'];
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'APPOINTMENT_STATUS':
            this.appointmentStatusOptions = res.value;
            break;
          default:
            console.log('name not found', res.name);
            break;
        }

      })
    })

  }

  onClinicChange(clinics: any) {
    clinics && clinics.length > 0 &&
      this.loadDoctorsByClinic(clinics);
    // reset doctor filter selection
    this.appointmentTable.filters['doctor'] = {
      value: [],
      matchMode: 'in'
    };
    this.appointmentTable._filter();
  }

  loadDoctorsByClinic(clinicId: any) {
    this.appointmentService.getDoctorLabels(clinicId).subscribe((resp: any) => {
      this.doctorOptions = resp.data || [];
    });
  }

  searchRFV(event: AutoCompleteCompleteEvent) {
    const query = event.query?.trim();
    if (!query || query.length < 3) return;

    this.masterService.getRFVMaster({ reason: query }).subscribe((resp: any) => {
      const suggestions = resp?.data ?? [];

      const matchExists = suggestions.some(
        (item: any) => item.label.toLowerCase() === query.toLowerCase()
      );

      if (!matchExists) {
        suggestions.unshift({ label: query, value: query });
      }

      this.rfvSuggestions = suggestions;
    });
  }

  reloadTable(): void {
    if (this.lazyLoadEvent) {
      this.loadAppointments(this.lazyLoadEvent);
    }
  }

  loadAppointments($event: TableLazyLoadEvent) {
    this.lazyLoadEvent = $event;
    this.isVisible = false;
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;

    let params = new HttpParams();
    const filter = $event.filters;
    const sortField = $event.sortField;
    const sortOrder = $event.sortOrder;

    if (filter) {
      const getValue = (filterMeta: any): any => {
        if (Array.isArray(filterMeta)) {
          return filterMeta.map(f => f.value); // return list of values
        } else if (filterMeta && 'value' in filterMeta) {
          return filterMeta.value;
        }
        return null;
      };

      // Usage:
      const patientValue = getValue(filter['patient']);
      if (patientValue) {
        params = params.append('patient', patientValue);
      }

      const doctorValue = getValue(filter['doctor']);
      if (doctorValue?.length > 0) {
        params = params.append('doctors', doctorValue);
      }

      const clinicValue = getValue(filter['clinic']);
      if (clinicValue?.length > 0) {
        params = params.append('clinics', clinicValue);
      }

      const dateRange = getValue(filter['appointmentDate']);
      if (dateRange?.length > 1) {
        params = params.append(
          'appointmentStartDate',
          this.utilityService.combineDateAndTime(dateRange[0], '00:00')
        );
        params = params.append(
          'appointmentEndDate',
          this.utilityService.combineDateAndTime(dateRange[1], '12:00')
        );
      }

      const typeValue = getValue(filter['appointmentType']);
      if (typeValue?.length > 0) {
        params = params.append('appointmentType', typeValue);
      }

      const statusValue = getValue(filter['appointmentStatus']);
      if (statusValue?.length > 0) {
        params = params.append('appointmentStatus', statusValue);
      }

      const reasonValue = getValue(filter['reasonForVisit']);
      if (reasonValue?.length > 0) {
        params = params.append('reasonForVisit', reasonValue);
      }


      params = params.append('isActive', 1);
    }



    if (sortField && sortOrder) {
      params = params.append('sort', (sortOrder != 1 ? '-' : '' + sortField));
    }
    params = params.append('page', Math.floor($event?.first / $event?.rows) ? Math.floor($event?.first / $event?.rows) : this.first);
    params = params.append('size', $event?.rows ? $event?.rows : this.size);

    this.appointmentService.searchAppointments(params).subscribe({
      next: (resp: any) => {
        this.appointments = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
      }
    }
    );
  }

  onSelectionChange() {
    console.log('Selection Changed:', this.selectedAppointment);
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }

  showToaster(detail: string, severity: string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  clear(table: Table) {
    table.clear();
    this.filterDate = []
  }

  addEditAppointment(appointment) {
    this.isVisible = true;
    this.appointment = appointment;
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  searchPatientName(event: AutoCompleteCompleteEvent) {
    const query = event.query?.trim();
    if (!query || query.length < 3) return;
    this.patientService.searchPatientByName({ name: query }).subscribe((resp: any) => {
      this.patientSuggestions = resp.data;
    })
  }

  onDateRangeSelect(dateRange: Date[], filter: Function) {
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      filter(dateRange);
    }
  }

  updateAppointmentStatus(appointmentIds: any, status) {
    this.appointmentService.updateAppointmentStatus({ appointmentIds: appointmentIds, status: status }).subscribe((reap: any) => {
      this.reloadTable();
    })
  }

}
