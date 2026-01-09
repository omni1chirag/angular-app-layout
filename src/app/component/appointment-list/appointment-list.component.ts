import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { ApiResponse, PaginationResponse } from '@interface/api-response.interface';
import { AppointmentList, AppointmentType, TelevideoStatusDetail, VisitMaster } from '@interface/appointment.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '@service/appointment.service';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { SessionStorageService } from '@service/session-storage.service';
import { ConfirmationService, FilterMetadata, MenuItem } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from "primeng/dialog";
import { DocumentListResponse } from '@interface/document.interface';
import { DocumentService } from '@service/document.service';
import { DocumentAddEditComponent } from "src/app/document-add-edit/document-add-edit.component";
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TextareaModule } from 'primeng/textarea';
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
    DatePickerModule,
    PageHeaderDirective,
    TableAutoScrollDirective,
    MultiSelectModule,
    PaginatorModule,
    SelectButtonModule,
    TooltipModule,
    TranslateModule,
    ConfirmDialog, ConfirmDialogModule, Dialog, DocumentAddEditComponent,
    ConfirmPopupModule, TextareaModule, ...GLOBAL_CONFIG_IMPORTS],
  providers: [ConfirmationService],
  templateUrl: './appointment-list.component.html',
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly platformService = inject(PlatformService);
  private readonly _router = inject(Router);
  private readonly appointmentService = inject(AppointmentService);
  private readonly masterService = inject(MasterService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly documentService = inject(DocumentService);

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('appointmentTable') appointmentTable!: Table;

  organizationId: string;

  // Filter variables
  filterDate: string[] = []

  private readonly baseActions = [
    { label: 'Upload Documents', icon: 'pi pi-replay' },
    { label: 'View Documents', icon: 'pi pi-replay' },
    { label: 'Reschedule', icon: 'pi pi-replay' },
    { label: 'Cancel', icon: 'pi pi-times' },
  ];
  private readonly hiddenActionsByStatus: Record<string, string[]> = {
    COMPLETED: ['Cancel', 'Reschedule', 'Upload Documents'],
    CANCELLED: ['Cancel', 'Reschedule', 'Upload Documents'],
    CONFIRMED: [],
    ONGOING: ['Cancel', 'Reschedule'],
    RESCHEDULED: [],
  };
  clinicOptions: LabelValue<string>[] = [];
  doctorOptions: LabelValue<string>[] = [];
  appointmentTypeOptions: LabelValue<AppointmentType>[] = [];

  appointmentStatusOptions: LabelValue<string>[] = [];
  providerList = null;
  rfvSuggestions: LabelValue<string>[] = [];


  // Table variables
  appointments: AppointmentList[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 150;
  showLoader = true;

  // frozen elements
  actions = true;
  isBrowser = false;
  appointment: {
    appointmentId: string;
    appointmentStatus?: string;
  };

  //store table events
  lazyLoadEvent: TableLazyLoadEvent | null = null;

  // patientDetail;
  clinicIds;
  intervalId: NodeJS.Timeout;
  currentUserDoctorId: string;
  currentlyUsedClinic: string;
  redirectSource: string;
  public tableFilters: Record<string, FilterMetadata> = {};
  firstTimeLoad = false;
  @HostListener('window:resize')
  onResize(): void {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }
  patientId: string;

  activeStatusForVideoCall = ['Confirmed', 'Ongoing'];

  documentVisible = false;
  @ViewChild('documentTable') documentTable: Table;
  documentId: string | null = null;
  isDocumentVisible = false;
  documents: DocumentListResponse[] = [];
  showLoader_document = true;
  selectedAppointment: AppointmentList;
  cancelReason = ''
  constructor(
  ) {
    this.isBrowser = this.platformService.isBrowser();
    if (this.isBrowser) {
      this.organizationId = this.localStorageService.getOrganizationId();
      this.clinicOptions = this.localStorageService.getUserMappedClinics();
      this.clinicIds = this.clinicOptions.map(clinic => clinic.value);
      this.currentUserDoctorId = this.localStorageService.getCurrentUserDoctorId();
      this.redirectSource = this.localStorageService.getItem<string>("redirectSource");
      this.currentlyUsedClinic = this.localStorageService.getCurrentlyUsedClinic();
      this.patientId = this.localStorageService.getPatientId();
    }
  }

  ngOnInit(): void {
    if (!this.isBrowser || !this.patientId) {
      return;
    }
    this.onResize();

    this.initializeMasterData();

    setTimeout(() => {
      this.intervalId = setInterval(() => {
        const vwrAppointments = this.getVirtualAppointments();
        if (vwrAppointments.length > 0) {
          this.televideoStatus(vwrAppointments);
        }
      }, 10000);
    }, 100);
  }

  televideoStatus(vwrAppointments: AppointmentList[]): void {
    this.appointmentService.getTelevideoStatusDetail<TelevideoStatusDetail[]>({ 'appointmentIds': vwrAppointments.map(vwr => vwr.appointmentId) }).subscribe({
      next: (data => {
        if (vwrAppointments.length > 0) {
          data.forEach(element => {
            const appointment = vwrAppointments.find(vwrA => vwrA.appointmentId == element.appointmentId);
            appointment.callStatus = element.callStatus;
            appointment.badgeColor = element.badgeColor;
          });
        }
      }),
      error: ((error) => {
        console.error('Error fetching televideo status details:', error);
      })
    })
  }

  getButtonSeverity(badgeColor: string): 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' {
    switch (badgeColor) {
      case 'btn-primary': return 'primary';
      case 'btn-green': return 'success';
      case 'btn-orange': return 'warn';
      case 'btn-success': return 'success';
      case 'btn-info': return 'info';
      case 'btn-default': return 'secondary';
      default: return 'secondary';
    }
  }

  initializeMasterData(): void {
    const params = ['APPOINTMENT_STATUS', 'CONSULT_TYPE'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name === 'APPOINTMENT_STATUS') {
          this.appointmentStatusOptions = res.value as LabelValue<string>[];
        } else if (res.name === 'CONSULT_TYPE') {
          this.appointmentTypeOptions = res.value as LabelValue<AppointmentType>[] || [];
        } else {
          console.error('name not found', res.name);
        }
      })
    })

    const requestParams = new HttpParams().append('patientId', this.patientId);
    this.appointmentService.getDoctorLabelsByPatientAppointments<LabelValue<string>[]>(requestParams).subscribe({
      next: (data) => {
        this.doctorOptions = data;
      }
    })
    this.appointmentService.getClinicLabelsByPatientAppointments<LabelValue<string>[]>(requestParams).subscribe({
      next: (data) => {
        this.clinicOptions = data;
      }
    })
  }

  searchRFV(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.trim();
    if (!query || query.length < 3) return;

    this.masterService.getRFVMaster<VisitMaster[]>(new HttpParams().append('reason', query)).subscribe(data => {
      const suggestions = data as LabelValue<string>[] ?? [];

      const matchExists = suggestions.some(
        (item: VisitMaster) => item.label.toLowerCase() === query.toLowerCase()
      );

      if (!matchExists) {
        suggestions.unshift({ label: query, value: query });
      }

      this.rfvSuggestions = suggestions;
    });
  }

  getVirtualAppointments(): AppointmentList[] {
    return (this.appointments ?? [])
      .filter(appointment => appointment.appointmentType === 'Video Call');
  }


  reloadTable(): void {
    if (this.lazyLoadEvent) {
      this.loadAppointments(this.lazyLoadEvent);
    }
  }

  loadAppointments($event: TableLazyLoadEvent): void {
    this.lazyLoadEvent = $event;
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;

    let params = new HttpParams();
    const filter = $event.filters;
    const sortField = $event.sortField;
    const sortOrder = $event.sortOrder;

    if (this.redirectSource && !this.firstTimeLoad) {
      this.firstTimeLoad = true
      if (this.redirectSource === 'todaysAppointment') {
        console.debug($event.filters['appointmentDate']);
        const today = this.dateTimeUtilityService.getCurrentDateTime("DD/MM/YYYY");

        this.tableFilters['appointmentDate'] = {
          value: [today, today],
          matchMode: 'dateIs'
        };
        this.filterDate = [today, today];

        this.tableFilters['clinic'] = {
          value: [this.currentlyUsedClinic],
          matchMode: 'contains'
        };
        console.debug($event.filters['appointmentDate']);

      } else if (this.redirectSource === 'upcommingAppointment') {
        console.debug($event.filters['appointmentDate']);
        const startDate = this.dateTimeUtilityService.getNextDate(1);
        const endDate = this.dateTimeUtilityService.getNextDate(7)
        this.tableFilters['appointmentDate'] = {
          value: [startDate, endDate],
          matchMode: 'dateIs'
        };
        this.filterDate = [startDate, endDate];
        this.tableFilters['clinic'] = {
          value: [this.currentlyUsedClinic],
          matchMode: 'contains'
        };
        console.debug($event.filters['appointmentDate']);
      }
    }
    params = this.setParams(filter, params);

    if (sortField && sortOrder) {
      params = params.append('sort', (sortOrder != 1 ? '-' : '' + sortField));
    }
    params = params.append('page', Math.floor($event?.first / $event?.rows) ? Math.floor($event?.first / $event?.rows) : this.first);
    params = params.append('size', $event?.rows ? $event?.rows : this.size);

    params = params.append('patient', this.patientId);

    this.appointmentService.searchAppointments<PaginationResponse<AppointmentList>>(params).subscribe({
      next: (data) => {
        this.appointments = data.content;
        this.appointments = this.appointments.map(app => ({
          ...app,
          menuItems: this.prepareMenuItems(app)
        }));
        this.totalRecords = data.totalElements;
        this.showLoader = false;
        const vwrAppointments = this.getVirtualAppointments();
        if (vwrAppointments.length > 0) {
          this.televideoStatus(vwrAppointments);
        }
      },
      error: () => {
        this.showLoader = false;
      }
    }
    );
  }

  private setParams(filter: Record<string, FilterMetadata | FilterMetadata[]>, params: HttpParams) {
    if (filter) {
      const getValue = (filterMeta: FilterMetadata | FilterMetadata[] | null | undefined): unknown => {
        if (Array.isArray(filterMeta)) {
          return filterMeta.map(f => f.value); // return list of values
        } else if (filterMeta && 'value' in filterMeta) {
          return filterMeta.value;
        }
        return null;
      };

      // Usage:
      const doctorValue = getValue(filter['doctor']) as string;
      if (doctorValue?.length > 0) {
        params = params.append('doctors', doctorValue);
      }

      const clinicValue = getValue(filter['clinic']) as string;
      if (clinicValue?.length > 0) {
        params = params.append('clinics', clinicValue);
      }

      const dateRange = getValue(filter['appointmentDate']) as string[];
      if (dateRange?.length > 1) {
        params = params.append(
          'appointmentStartDate',
          this.dateTimeUtilityService.combineDateAndTimeToString(dateRange[0], '00:00')
        );
        params = params.append(
          'appointmentEndDate',
          this.dateTimeUtilityService.combineDateAndTimeToString(dateRange[1], '23:59')
        );
      }

      const typeValue = getValue(filter['appointmentType']) as string;
      if (typeValue?.length > 0) {
        params = params.append('appointmentType', typeValue);
      }

      const statusValue = getValue(filter['appointmentStatus']) as string;
      if (statusValue?.length > 0) {
        params = params.append('appointmentStatus', statusValue);
      }

      const reasonValue = getValue(filter['reasonForVisit']) as string;
      if (reasonValue?.length > 0) {
        params = params.append('reasonForVisit', reasonValue);
      }


      params = params.append('isActive', 1);
    }
    return params;
  }

  clear(table: Table): void {
    table.clear();
    this.filterDate = []
  }

  rescheduleAppointment(appointment: AppointmentList): void {

    const isPastAppointment = this.dateTimeUtilityService.isPastDate(appointment.appointmentDateTime);
    const isWithinNextHour = this.dateTimeUtilityService.isWithinNextHour(appointment.appointmentDateTime);

    let message;
    if (isPastAppointment) {
      message = 'You cannot reschedule a past appointment.';
    }
    else if (isWithinNextHour) {
      message = 'You cannot reschedule an appointment within 1 hour of its scheduled time.';
    }

    if (message) {
      this.confirmationService.confirm({
        key: 'appointment-list-confirmation-dialog',
        header: 'Alert',
        message: message,
        acceptLabel: 'OK',
        rejectVisible: false,
        closable: false,
        blockScroll: true
      });
    } else {
      this.navigateTo(
        [`/home/appointment/${appointment?.appointmentId}/reschedule`],
      );
    }

  }

  navigateTo(route: string | string[], extras?: { queryParams: { appointment: string } }): void {
    if (extras) {
      this._router.navigate(Array.isArray(route) ? route : [route], extras);
    } else {
      this._router.navigate(Array.isArray(route) ? route : [route]);
    }
  }

  redirectToSummary(appointmentId: string, patientId: string): void {
    if (appointmentId && patientId) {
      this.navigateTo(
        [`/home/patient/${patientId}/summary`],
        { queryParams: { appointment: appointmentId } }
      );
    }
  }

  onDateRangeSelect(dateRange: string[], filter: (value: unknown) => void): void {
    if (dateRange?.length === 2 && dateRange[0] && dateRange[1]) {
      filter(dateRange);
    }
  }

  updateAppointmentStatus(appointmentIds: string[], status: string): void {
    this.appointmentService.updateAppointmentStatus<number>({ appointmentIds: appointmentIds, status: status }).subscribe(() => {
      this.reloadTable();
    })
  }

  joinPatient(appointment: AppointmentList): void {
    if (!this.dateTimeUtilityService.isWithinLast15Minutes(appointment.appointmentDateTime)) {
      console.debug('Appointment Obj: ', appointment);

      this.sessionStorageService.setItem('RoomName', appointment.roomName);
      this.sessionStorageService.setItem('DoctorNameJitsi', appointment.doctor.fullName);
      this.sessionStorageService.setItem('appointmentIdJitsi', appointment.appointmentId);

      const serverUrl = `${window.location.origin}/patient-portal/jitsi/jitsi-integration`;
      window.open(serverUrl, '', 'width=700,height=500,left=200,top=200');

      this.updateAppointmentStatus([appointment.appointmentId], 'ONGOING');
    } else {
      this.confirmationService.confirm({
        key: 'appointment-list-confirmation-dialog',
        header: 'Alert',
        message: 'You can join the video consultation on or before 15 minutes of your scheduled time only.',
        acceptLabel: 'OK',
        rejectVisible: false,
        closable: false,
        blockScroll: true
      });
    }
  }

  resendVirtualLink(appointmentId: string): void {
    this.appointmentService.resendVirtualLink<ApiResponse<string>>(appointmentId).subscribe({
      next: (resp) => {
        this.notificationService.showSuccess(resp.message)
      },
      error: ({ error }: { error: ApiResponse<unknown> }) => {
        this.notificationService.showError(error?.message || 'Something went wrong.')
      }
    });
  }

  downloadVisitReport(appointment: AppointmentList): void {

    const params = new HttpParams()
      .set('patient', appointment.patient.patientId)
      .set('appointment', appointment.appointmentId);

    this.appointmentService.generateVisitReport(params).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: (error) => {
        console.error('Error generating visit report:', error);
      }
    });
  }

  prepareMenuItems(appointment: AppointmentList): MenuItem[] {
    let appointmentStatus: string;
    const cancelStatuses = ['Cancelled by Doctor', 'Cancelled by Patient', 'Cancelled by Staff'];
    const completedStatuses = ['Completed with Prescription', 'Completed without Prescription'];

    if (cancelStatuses.includes(appointment.appointmentStatus)) {
      appointmentStatus = 'CANCELLED';
    } else if (completedStatuses.includes(appointment.appointmentStatus)) {
      appointmentStatus = 'COMPLETED';
    } else if ("No Show / Missed" === appointment.appointmentStatus) {
      appointmentStatus = "NO_SHOW";
    } else {
      appointmentStatus = appointment.appointmentStatus?.toUpperCase();
    }

    const hiddenLabels = this.hiddenActionsByStatus[appointmentStatus] || [];

    let actions = this.baseActions
      .filter(item => !hiddenLabels.includes(item.label))
      .filter(item => !(item.label === 'Resend Link' && appointment.appointmentType !== 'Video Call'));

    if (appointment.chartingStatus === 'Pending') {
      actions = actions.filter(item => item.label !== 'View Charting');
    } else {
      actions = actions.filter(item => item.label !== 'Start Charting');
    }

    if (this.dateTimeUtilityService.isPastDate(appointment?.appointmentDateTime)) {
      actions = actions
        .filter(item => item.label !== "Upload Documents");
    }
    return actions.map(item => ({
      ...item,
      command: () => this.handleAction(item.label, appointment)
    }));
  }


  handleAction(label: string, appointment: AppointmentList): void {
    this.selectedAppointment = appointment;
    switch (label) {
      case 'Reschedule':
        this.rescheduleAppointment(appointment);
        break;
      case 'Cancel':
        this.cancelApointmentStatus(appointment);
        break;
      case 'Upload Documents':
        this.uploadDocuments(appointment);
        break;
      case 'View Documents':
        this.viewDocuments(appointment);
        break;
      case 'Start Charting':
      case 'View Charting':
        this.redirectToSummary(appointment?.appointmentId, appointment.patient?.patientId);
        break;
      case 'Generate Visit Report':
        this.downloadVisitReport(appointment);
        break;
      case 'Print Prescription':
        this.generatePrescriptionsReport(appointment);
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.redirectSource) {
      this.localStorageService.removeItem('redirectSource');
    }
  }

  generatePrescriptionsReport(appointment: AppointmentList): void {

    const params = new HttpParams()
      .set('patient', appointment.patient.patientId)
      .set('appointment', appointment.appointmentId);

    this.appointmentService.printPrescriptions(params).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: (error) => {
        console.error('Error generating prescriptions report:', error);
      }
    });
  }

  loadDocuments(): void {
    if (!this.isBrowser || !this.selectedAppointment) return;

    let params = new HttpParams()
      .set('patientId', this.patientId)
      .set('appointmentId', this.selectedAppointment?.appointmentId);

    ([{ field: 'docTitle', order: 1 }])?.forEach((sort) => {
      const field = sort.field;
      const order = sort.order;
      params = params.append('sort', (field + ' ' + (order == 1 ? 'asc' : 'desc')));
    });
    this.showLoader_document = true;
    this.documentService.getDocumentsByPatientAndAppointment<DocumentListResponse[]>(params).subscribe({
      next: (data) => {
        this.documents = data;
        this.showLoader_document = false;
      },
      error: () => {
        this.showLoader_document = false;
      }
    })
  }

  uploadDocuments(appointment: AppointmentList): void {
    this.selectedAppointment = appointment;
    this.documentId = null;
    this.isDocumentVisible = true;
  }

  viewDocuments(appointment: AppointmentList): void {
    this.selectedAppointment = appointment;
    this.loadDocuments();
    this.documentVisible = true;

  }

  viewDocument(documentId: string): void {
    this.documentService.viewDocument(documentId);
  }

  addEditDocument(documentId: string | null): void {
    this.documentId = documentId;
    this.isDocumentVisible = true;
  }

  deleteDocument(documentId: string): void {
    this.confirmationService.confirm({
      key: 'appointment-list-confirmation-dialog',
      header: 'Alert',
      message: 'Do you want to delete this document?',
      closable: false,
      blockScroll: true,
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        const documentIndex = this.documents.findIndex(doc => doc.documentId === documentId);
        if (documentIndex !== -1) {
          this.documents.splice(documentIndex, 1);
        }

        this.documentService.deleteDocument(documentId).subscribe();
      }
    });
  }

  cancelApointmentStatus(appointment: AppointmentList): void {
    this.cancelReason = '';
    console.error(appointment);

    this.confirmationService.confirm({
      key: 'appointment-list-cancellation-dialog',
      header: 'Please confirm to proceed moving forward.',
      acceptLabel: 'OK',
      rejectVisible: true,
      closable: false,
      blockScroll: true,
      rejectButtonProps: {
        icon: 'pi pi-times',
        label: 'Cancel',
        outlined: true,
        size: 'small'
      },
      acceptButtonProps: {
        icon: 'pi pi-check',
        label: 'Confirm',
        size: 'small'
      },
      accept: () => {
        if (!this.cancelReason.trim()) {
          this.notificationService.showError('Please enter a reason', 'Required');
          return;
        }
        this.appointmentService.updateAppointmentStatus<number>({ appointmentIds: [appointment.appointmentId], status: 'CANCELLED_BY_PATIENT', reason: this.cancelReason }).subscribe(() => {
          this.reloadTable();
        })
      }
    });
  }
}
