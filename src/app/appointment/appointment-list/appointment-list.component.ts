import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../../directive/page-header.directive';
import { TableAutoScrollDirective } from '../../directive/table-auto-scroll.directive';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Appointment, appointmentTypeOption, externalAppointments, paymentstatusOption, practiceList, providerList, reasonForVisits } from '../appointment.model';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';

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
    TableAutoScrollDirective
  ],
  providers: [MessageService],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent {
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;
  filterDate :Date[] = []
  patientSuggestions: any[] = [];
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

  practiceList = practiceList;
  appointmentTypeOption = appointmentTypeOption
  providerList = providerList
  reasonForVisits = reasonForVisits
  paymentstatusOption = paymentstatusOption;

  appointments: Array<Appointment> = [];
  actions: boolean = true;
  isBrowser: boolean = false;
  constructor(private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: object,
    private _router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const currentListString: string = localStorage.getItem('appointments') || '[]';
      this.appointments = JSON.parse(currentListString);
      this.appointments = [...this.appointments, ...externalAppointments]
    }
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
  }
  addEditMode(appointment?: any) {
    if (appointment && isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('appointment', JSON.stringify(appointment))
      } catch (error) {
        console.log(error);

      }
    }
    this.navigateTo('/home/appointment/add-edit');

  }
  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  searchPatientName(event: AutoCompleteCompleteEvent) {
    if (event.query.length < 3) return;
    this.patientSuggestions = this.appointments.filter(item => item.patientName.includes(event.query)).map(item => { return { name: item.patientName, code: item.patientName } });
  }

}
