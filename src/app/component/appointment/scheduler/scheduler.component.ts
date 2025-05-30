import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CalendarOptions, DatesSetArg, EventApi, EventClickArg, EventDropArg, EventInput, EventSourceFuncArg, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import { AppointmentService } from '@service/appointment.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'
import { UtilityService } from '@service/utility.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import { AddEditAppointmentComponent } from "../appointment-add-edit/appointment-add-edit.component";
import { Popover, PopoverModule } from 'primeng/popover';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Appointment {
  title: string;
  appointmentId: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  backgroundColor?: string;
  textColor?: string;
  patient: {
    name: string;
    patientId: string;
    gender: string;
    dateOfBirth: string;
    age: string;
  };
  doctor: {
    name: string;
    doctorId: string;
  };
  description?: string;
  status?: string;
  type?: string; // Added type field for appointment type
  rfv?: string; // Reason for visit
}

@Component({
  selector: 'app-scheduler',
  imports: [
    AutoCompleteModule,
    DividerModule,
    FormsModule,
    FullCalendarModule, CommonModule,
    AddEditAppointmentComponent,
    PopoverModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements OnInit {
  currentView: string = 'timeGridDay';  //timeGridWeek
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('calendarContainer') calendarContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('op') popover: Popover;
  calendarOptions: CalendarOptions = {
    initialView: this.currentView,
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prevYear,prev,next,nextYear today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotLabelInterval: '00:15:00',
    slotDuration: '00:15:00',
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'lowercase'
    },
    height: 600,
    selectOverlap: false,  // prevent booking over other events
    allDaySlot: false, // disable all-day slot
    stickyHeaderDates: "auto", // sticky header dates 
    contentHeight: 'autoFit',
    events: (info: EventSourceFuncArg, success: (events: EventInput[]) => void, failure: (error: Error) => void) => {
      this.loadAppointments(info, success, failure);
    },
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleDateSelect.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    viewDidMount: this.handleViewChange.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this),
  };
  isBrowser: boolean = false;
  columnWidth = 150;
  organizationId: string;
  appointments: Appointment[] = [];
  isVisible: boolean = false;
  appointmentId: any;
  tooltipContent: SafeHtml = '';

  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private appointmentService: AppointmentService,
    private utilityService: UtilityService, private sanitizer: DomSanitizer
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
    // this.loadCalendarConfig();
  }

  ngOnDestroy(): void {

  }


  refreshCalendar(): void {
    console.log('refreshCalendar() called');
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.refetchEvents(); // This will trigger the events function
  }

  private handleDatesSet(dateInfo: DatesSetArg): void {
    console.log('handleDatesSet() Date range changed:', dateInfo.start, dateInfo.end);
    if (this.calendarComponent) {
      this.refreshCalendar();
    }
  }

  private lastViewType = '';

  handleViewChange(arg: { view: ViewApi }) {
    console.log('handleViewChange() View changed:', arg.view.type);
    if (this.lastViewType !== arg.view.type) {
      this.lastViewType = arg.view.type;
      this.currentView = arg.view.type;
      this.refreshCalendar();
    }
  }


  isLoading = false;

  private loadAppointments(
    info: EventSourceFuncArg,
    success: (events: EventInput[]) => void,
    failure: (error: Error) => void
  ): void {
    this.isLoading = true;

    const params = {
      start: this.utilityService.combineDateAndTime(info.start, '00:00'),
      end: this.utilityService.combineDateAndTime(info.end, '00:00'),
    };

    this.appointmentService.getAppointments(params).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (resp: any) => {
        const events = this.mapAppointmentsToEvents(resp.data);
        success(events); // Important: call the success callback
        this.appointments = resp.data;
        console.log('Appointments loaded:', this.appointments);
      },
      error: (err) => {
        console.error('Failed to load appointments', err);
        failure(err); // Important: call the failure callback
      }
    });
  }

  private loadCalendarConfig(): void {
    // this.calendarConfig.getConfig().subscribe(config => {
    //   this.calendarOptions.slotDuration = config.slotDuration;
    //   this.calendarOptions.slotMinTime = config.minTime;
    //   this.calendarOptions.slotMaxTime = config.maxTime;
    // });
  }

  private mapAppointmentsToEvents(appointments: Appointment[]): any[] {
    return appointments.map(appointment => ({
      id: appointment.appointmentId,
      title: `${appointment.patient.name} - ${appointment.doctor.name}`,
      start: appointment.startTime,
      end: appointment.endTime,
      duration: appointment.durationMinutes,
      backgroundColor: appointment.backgroundColor || '#3b82f6',
      textColor: appointment.textColor || '#ffffff',
      extendedProps: {
        patient: appointment.patient,
        doctor: appointment.doctor,
        description: appointment.description,
        status: appointment.status
      }
    }));
  }

  appointment: {
    appointmentId?: string;
    appointmentStartDateTime?: Date;
    appointmentEndDateTime?: Date;
  }

  handleDateSelect(selectInfo: any): void {
    console.log('handleDateSelect() Selected Info:', selectInfo);
    const { start, end } = selectInfo;
    this.appointment = {
      appointmentStartDateTime: start,
      appointmentEndDateTime: end
    }
    this.isVisible = true;
  }

  handleEventClick(clickInfo: EventClickArg): void {
    console.log('handleEventClick() Clicked Info:', clickInfo);
    const appointment = this.appointments.find(a => a.appointmentId === clickInfo.event.id);
    if (appointment) {
      this.appointmentId = appointment.appointmentId;
      this.appointment = {
        appointmentId: appointment.appointmentId,
        appointmentStartDateTime: appointment.startTime,
        appointmentEndDateTime: appointment.endTime
      };
      this.isVisible = true;
    }
  }

  handleEventDrop(dropInfo: EventDropArg): void {
    console.log('handleEventDrop() Dropped Info:', dropInfo);
    const appointment = this.appointments.find(a => a.appointmentId === dropInfo.event.id);
    if (appointment) {
      const updatedAppointment = {
        startDateTime: this.utilityService.combineDateAndTime(dropInfo.event.start!, dropInfo.event.start!.getHours() + ':' + dropInfo.event.start!.getMinutes()),
        endDateTime: this.utilityService.combineDateAndTime(dropInfo.event.end!, dropInfo.event.end!.getHours() + ':' + dropInfo.event.end!.getMinutes()),
      };
      this.appointmentService.resizeAppointment(appointment.appointmentId, updatedAppointment).subscribe({
        error: (err) => {
          console.error('Failed to update appointment', err);
          this.refreshCalendar(); // Revert changes if update fails
        }
      });
    }
  }

  handleEventResize(resizeInfo: EventResizeDoneArg): void {
    console.log('handleEventResize() Resized Info:', resizeInfo);
    const appointment = this.appointments.find(a => a.appointmentId === resizeInfo.event.id);
    if (appointment) {
      const updatedAppointment = {
        startDateTime: this.utilityService.combineDateAndTime(resizeInfo.event.start!, resizeInfo.event.start!.getHours() + ':' + resizeInfo.event.start!.getMinutes()),
        endDateTime: this.utilityService.combineDateAndTime(resizeInfo.event.end!, resizeInfo.event.end!.getHours() + ':' + resizeInfo.event.end!.getMinutes()),
      };
      this.appointmentService.resizeAppointment(appointment.appointmentId, updatedAppointment).subscribe({
        error: (err) => {
          console.error('Failed to update appointment', err);
          this.refreshCalendar(); // Revert changes if update fails
        }
      });
    }
  }

  handleEventDidMount(info: { event: EventApi, el: HTMLElement }) {

    if (info.el && info.event.title != "") {
      // info.el.style.cursor = 'pointer';

      info.el.addEventListener('mouseenter', (event: MouseEvent) => {
        this.tooltipContent = this.setPopoverContent(info.event);
        this.popover.toggle(event);
      });

      info.el.addEventListener('mouseleave', () => {
        this.popover.hide();
      });
    }
  }

  setPopoverContent(event: EventApi) {
    console.log('setPopoverContent event: ', event.id);
    const appointment = this.appointments.find(a => a.appointmentId === event.id);
    const html = `
      <div style="max-width: 300px; margin-5px;">
        <div class=text-center mb-2" style="background-color: #1aa5b3; border-radius: 0.5rem 0.5rem 0 0; padding:5px; font-size: 14px;color: white">
          <strong>${event.title}</strong>
        </div>
        <div style="padding: 5px; font-size: 10px; border-radius: 0 0 0.5rem 0.5rem; background-color: rgba(26, 165, 179, 0.12);">
        <p><strong>Appointment Type: </strong>${appointment.type}</p>
          <p><strong>Start:</strong> ${appointment.startTime}</p>
          <p><strong>End:</strong> ${appointment.endTime}</p>
          <p><strong>Gender: </strong>${appointment.patient.gender}</p>
          <p><strong>DOB: </strong>${appointment.patient.dateOfBirth}</p>
          <p><strong>Age: </strong>${appointment.patient.age}</p>
          <p><strong>Reason For Visit: </strong>${appointment.rfv}</p>
          </div>
      </div>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(html);

  }
}