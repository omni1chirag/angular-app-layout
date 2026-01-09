import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { MedicationService } from '@service/medication.service';
import { PlatformService } from '@service/platform.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { LabelValueSubstance, Medication, MedicationList } from '@interface/medication.interface';
import { PaginationResponse } from '@interface/api-response.interface';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-medication-patient-list',
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
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './medication-patient-list.component.html'
})
export class MedicationPatientListComponent implements OnInit {

  private readonly medicationService = inject(MedicationService);
  private readonly masterService = inject(MasterService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);

  visible = false;
  medicationsList: MedicationList[] = [];
  medicationSuggestion: LabelValueSubstance<string>[] = [];
  frequentlyUsedMedicines: LabelValue<string>[] = []
  medicinesList: LabelValue<string>[] = [];
  timingMap: Map<string, string> = new Map<string, string>();
  statusMap: Map<string, string> = new Map<string, string>();
  quantityUnitMap: Map<string, string> = new Map<string, string>();
  durationUnitMap: Map<string, string> = new Map<string, string>();
  frequencyMap: Map<string, string> = new Map<string, string>();
  readonly patientId = this.localStorageService.getPatientId();
  readonly appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
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
  medicationId = signal<string>(undefined);
  medicationName = signal<string>(undefined);
  readonly signOff = input.required<number>();
  substanceIdentifiers = signal<string>(undefined);

  @ViewChild('medicationTable') medicationTable: Table;

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
    if (!this.isBrowser) return;

    this.initializeMasterData();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
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
    params = params.append('sort', 'medicationName asc');

    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }

    const apiCall = this.medicationService.getMedications(this.patientId, params)

    apiCall.subscribe({
      next: (data: PaginationResponse<MedicationList>) => {
        if (data) {
          this.medicationsList = data?.content;
          this.totalRecords = data?.totalElements;
          this.showLoader = false;
        } else {
          this.showLoader = false;
        }
      },
      error: () => {
        this.showLoader = false;
        this.medicationsList = [];
      }
    });
  }

  removeMedication(index: number, item?: Medication): void {
    this.medicationsList.splice(index, 1);
    this.deleteMedication(item.medicationId);
  }

  addMedication(med: LabelValueSubstance<string>): void {
    this.visible = true;
    this.medicationId.set(null);
    this.medicationName.set(med?.value);
    this.substanceIdentifiers.set(med?.substanceIdentifier);
  }

  editMedication(medication: Medication): void {
    this.visible = true;
    this.medicationId.set(medication.medicationId);
    this.medicationName.set(null);
  }

  initializeMasterData(): void {
    const params = ['TIMING', 'DURATION_UNIT', 'QUANTITY_UNIT', 'MEDICATION_STATUS', 'MEDICATION_FREQUENCY'];

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        switch (res.name) {
          case 'TIMING':
            this.timingMap = new Map(
              res.value.map((item: LabelValue<string>) => [item.value, item.label])
            );
            break;
          case 'DURATION_UNIT':
            this.durationUnitMap = new Map(
              res.value.map((item: LabelValue<string>) => [item.value, item.label])
            );
            break;
          case 'QUANTITY_UNIT':
            this.quantityUnitMap = new Map(
              res.value.map((item: LabelValue<string>) => [item.value, item.label])
            );
            break;
          case 'MEDICATION_STATUS':
            this.statusMap = new Map(
              res.value.map((item: LabelValue<string>) => [item.value, item.label])
            );
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
    this.getAllFrequentlyUsedMedicines();
  }

  getAllFrequentlyUsedMedicines(): void {
    this.medicationService.getAllFrequentlyUsedMedicines().subscribe({
      next: (data: LabelValue<string>[]) => {
        this.frequentlyUsedMedicines = data;
      },
      error: (error) => {
        console.error('Error fetching frequently used medication suggestions:', error);
      }
    });
  }

  deleteMedication(medicationId: string): void {

    this.medicationService.deleteMedication(this.patientId, medicationId).subscribe({
      next: () => {
        this.loadMedications();
      },
      error: (error) => {
        console.error('Error deleting medication:', error);
      }
    });
  }

}
