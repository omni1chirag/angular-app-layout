import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { PaginationResponse } from '@interface/api-response.interface';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { LabelValueSubstance, Medication, MedicationList } from '@interface/medication.interface';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '@service/appointment.service';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { MedicationService } from '@service/medication.service';
import { MultiLangService } from '@service/multi-lang.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { MenuItem } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-patient-medication-list',
  imports: [
    TranslateModule,
    ToolbarModule,
    TableModule,
    CommonModule,
    ButtonModule,
    AutoCompleteModule,
    DrawerModule,
    DividerModule,
    TagModule,
    TooltipModule,
    PageHeaderDirective,
    ToggleButtonModule,
    FormsModule,
    SelectModule,
    DatePickerModule,
    TableAutoScrollDirective,
    MenuModule,
    ...GLOBAL_CONFIG_IMPORTS,
    MultiSelectModule
  ],
  templateUrl: './medication-list.component.html',
})
export class PatientMedicationListComponent implements OnInit {

  private readonly medicationService = inject(MedicationService);
  private readonly patientService = inject(PatientService);
  private readonly utilityService = inject(UtilityService);
  private readonly masterService = inject(MasterService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);

  langService = inject(MultiLangService);
  medicationsList: MedicationList[] = [];
  visible = false;
  patientId = signal<string>(undefined);
  appointmentId = signal<string>(undefined);
  isBrowser = false;
  showLoader = true;
  first = 0;
  totalRecords = 0;
  size = 10;
  statusSeverityMap = new Map<number, 'success' | 'secondary' | 'info' | 'warn' | 'danger'>([
    [1, 'success'],
    [2, 'info'],
    [3, 'secondary'],
    [4, 'warn'],
    [5, 'danger'],
  ]);
  lastUpdatedDate = true;
  patientSuggestions: LabelValue<string>[] = []
  medicationSuggestions: LabelValueSubstance<string>[] = [];
  statusOptions: LabelValue<number>[] = [];
  medicationId = signal<string>(undefined);
  medicationName = signal<string>(undefined);
  frequencyMap: Map<string, string> = new Map<string, string>();
  addWorkflow = false;
  deleteWorkflow = false;
  menuItemsMap: Record<number, MenuItem[]> = {};
  menuTranslations: Record<string, string> = {};
  actions = true;
  loading = false;
  filterDate: string[] = []
  columnWidth = 200;
  clinicOptions: LabelValue<string>[] = [];
  doctorOptions: LabelValue<string>[] = [];

  @ViewChild('medicationTable') medicationTable: Table;

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
    if (!this.isBrowser) return;
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();

    this.langService.getTranslateMsgFromKey('TOOLTIP.NOT_AUTHORIZED').then((message) => {
      this.menuTranslations['NOT_AUTHORIZED'] = message;
    });
    this.langService.getTranslateMsgFromKey('TOOLTIP.LOCKED_CHART').then((message) => {
      this.menuTranslations['LOCKED_CHART'] = message;
    });
  }

  loadMedications(event?: TableLazyLoadEvent): void {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;
    this.first = event?.first || 0;
    this.size = event?.rows || 10;

    let params = new HttpParams();
    params = params.append('page', Math.floor(this.first / this.size));
    params = params.append('size', this.size);

    const patientId = this.localStorageService.getPatientId();
    params = params.append('patient', patientId);

    if (this.appointmentId()) {
      params = params.append('appointment', this.appointmentId());
    }

    // ---------------- DATE RANGE FIX ----------------
    if (event?.filters?.['appointmentDate']) {
      const filterMeta = event.filters['appointmentDate'];
      const filterObj = Array.isArray(filterMeta) ? filterMeta[0] : filterMeta;

      if (filterObj?.value) {
        let startDate: Date | string;
        let endDate: Date | string;

        if (!Array.isArray(filterObj.value)) {
          startDate = filterObj.value.startDate;
          endDate = filterObj.value.endDate;
        } else {
          startDate = filterObj.value[0];
          endDate = filterObj.value[1];
        }

        if (startDate && endDate) {
          const start = this.dateTimeUtilityService.combineDateAndTimeToString(startDate, '00:00');
          const end = this.dateTimeUtilityService.combineDateAndTimeToString(endDate, '23:59');

          params = params.append('appointmentStartDateTime', start);
          params = params.append('appointmentEndDateTime', end);
        }
      }
    }

    // REMOVE appointmentDate BEFORE passing filters to utility method
    const filters = { ...event?.filters };
    delete filters['appointmentDate'];

    params = this.utilityService.setTableWhereClause(
      filters as Record<string, { value: unknown }>,
      params
    );

    this.patientId.set(patientId);

    this.medicationService.getAllMedications(params).subscribe({
      next: (data: PaginationResponse<MedicationList>) => {
        if (data) {
          this.medicationsList = data?.content;
          this.totalRecords = data?.totalElements;
          this.menuItemsMap = {};

          this.medicationsList.forEach((item, $index) => {
            this.menuItemsMap[item.medicationId] = this.setMenuItems(item, $index);
          });
        } else {
          this.medicationsList = [];
          this.menuItemsMap = {};
        }
        this.showLoader = false;
      },
      error: (err) => {
        console.error('Error fetching medications:', err);
        this.medicationsList = [];
        this.menuItemsMap = {};
        this.showLoader = false;
      }
    });
  }


  searchPatients($event: AutoCompleteCompleteEvent): void {
    const query = $event.query;
    if (query && query.length > 2) {
      this.patientService.searchPatients(query).subscribe((data: LabelValue<string>[]) => {
        this.patientSuggestions = data;
      });
    }
  }

  searchDrug(searchParam: string): void {
    this.medicationSuggestions = [{ label: searchParam, value: searchParam }];
  }

  removeMedication(index: number, item?: MedicationList): void {
    this.medicationsList.splice(index, 1);
    this.patientId.set(item.patientId);
    this.deleteMedication(item.medicationId);
  }

  editMedication(medication: Medication): void {
    this.visible = true;
    this.patientId.set(medication.patientId);
    this.medicationId.set(medication.medicationId);
  }

  deleteMedication(medicationId: string): void {

    this.medicationService.deleteMedication(this.patientId(), medicationId).subscribe({
      next: () => {
        this.loadMedications();
      },
      error: (error) => {
        console.error('Error deleting medication:', error);
      }
    });
  }

  initializeMasterData(): void {
    const params = ['MEDICATION_STATUS', 'MEDICATION_FREQUENCY'];

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        switch (res.name) {
          case 'MEDICATION_STATUS':
            this.statusOptions = res.value as LabelValue<number>[];
            break;
          case 'MEDICATION_FREQUENCY':
            this.frequencyMap = new Map(
              res.value.map((item: LabelValue<string>) => [item.value, item.label])
            );
            break;
          default:
            console.warn('name not found', res.name);
            break;
        }
      });
    });
    const patientId = this.localStorageService.getPatientId();
    this.patientId.set(patientId);
    const requestParams = new HttpParams().append('patientId', patientId);
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

  setMenuItems(item: MedicationList, $index: number): MenuItem[] {
    const menuItems: MenuItem[] = [];

    if (item.isEditable && !item.appointmentSignOff) {
      if (this.addWorkflow) {
        menuItems.push({
          label: 'EDIT',
          icon: 'pi pi-pencil',
          command: () => this.editMedication(item)
        });
      }

      if (this.deleteWorkflow) {
        menuItems.push({
          label: 'DELETE',
          icon: 'pi pi-trash',
          command: () => this.removeMedication($index, item)
        });
      }
    } else {
      let tooltip: string;
      if (!item.isEditable) {
        tooltip = this.menuTranslations['NOT_AUTHORIZED'];
      } else if (item.appointmentSignOff == 1) {
        tooltip = this.menuTranslations['LOCKED_CHART'];
      } else {
        tooltip = null;
      }

      if (this.deleteWorkflow) {
        menuItems.push({
          label: 'DELETE',
          icon: 'pi pi-trash',
          disabled: !item.isEditable || item.appointmentSignOff == 1,
          command: () => this.removeMedication($index, item),
          tooltip: tooltip
        });
      }
    }
    return menuItems;
  }

  printPrescriptions(patientId: string, appointmentId: string): void {
    this.loading = true;
    const params = new HttpParams()
      .set('patient', patientId)
      .set('appointment', appointmentId);

    this.medicationService.printPrescriptions(params).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating prescriptions report:', error);
        this.loading = false;
      }
    });
  }

  onDateRangeSelect(dateRange: string[], filter: (value: unknown) => void): void {
    if (dateRange?.length === 2 && dateRange[0] && dateRange[1]) {
      filter({
        startDate: dateRange[0],
        endDate: dateRange[1]
      });
    }
  }

}
