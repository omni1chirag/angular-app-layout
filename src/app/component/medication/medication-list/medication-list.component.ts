import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { MasterService } from '@service/master.service';
import { MedicationAddEditComponent } from '../medication-add-edit/medication-add-edit.component';
import { MedicationService } from '@service/medication.service';
import { ActivatedRoute } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { LabelValue } from '@interface/common-master.interface';
import { PlatformService } from '@service/platform.service';

@Component({
  selector: 'app-medication-list',
  imports: [
    TranslateModule,
    ToolbarModule,
    TableModule,
    CommonModule,
    ButtonModule,
    AutoCompleteModule,
    DrawerModule,
    DividerModule,
    MedicationAddEditComponent,
    TagModule
  ],
  templateUrl: './medication-list.component.html',
  styleUrl: './medication-list.component.scss'
})
export class MedicationListComponent implements OnInit {

  visible: boolean = false;
  medicationsList: any[] = [];

  medicationSuggestion: LabelValue[] = [];
  frequentlyUsedMedicines: LabelValue[] = []
  medicinesList: LabelValue[] = [];

  selectedMedication = signal<any>(null);
  timingOptions: LabelValue[] = [];
  statusOptions: LabelValue[] = [];
  quantityUnitOptions: LabelValue[] = [];
  durationUnitOptions: LabelValue[] = [];
  readonly patientId = input.required<string>();
  readonly appointmentId = input.required<string>();
  isBrowser: boolean = false;
  rowsPerPage = 10;

  constructor(private medicationService: MedicationService,
    private masterService: MasterService,
    private platformService: PlatformService,) {
    this.isBrowser = platformService.isBrowser();
    if (!this.isBrowser) return;

    this.initializeMasterData();
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    this.loadMedications();
  }

  loadMedications(event?: any) {

    const apiCall = this.appointmentId()
      ? this.medicationService.getMedications(this.patientId(), this.appointmentId())
      : this.medicationService.getMedications(this.patientId());

    apiCall.subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.medicationsList = response.data;
        } else {
          this.medicationsList = [];
        }
      },
      error: (err) => {
        this.medicationsList = [];
      }
    });
  }

  removeMedication(index: number, item?: any): void {
    this.medicationsList.splice(index, 1);
    this.deleteMedication(item.medicationId);
  }

  addMedication(event: any): void {
    this.visible = true;
    const medication = {
      medicationName: event?.value
    };
    this.selectedMedication.set(medication);

  }

  editMedication(medication: any): void {
    this.visible = true;
    this.selectedMedication.set(medication);
  }

  initializeMasterData() {
    const params = ['TIMING', 'DURATION_UNIT', 'QUANTITY_UNIT', 'MEDICATION_STATUS'];

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'TIMING':
              this.timingOptions = res.value
              break;
            case 'DURATION_UNIT':
              this.durationUnitOptions = res.value
              break;
            case 'QUANTITY_UNIT':
              this.quantityUnitOptions = res.value
              break;
            case 'MEDICATION_STATUS':
              this.statusOptions = res.value
              break;
            default:
              console.log('name not found', res.name);
              break;
          }
        })
      },
      error: (error) => {
        console.error('Error fetching master data:', error);
      }
    });

    this.getAllFrequentlyUsedMedicines();
  }

  getStatus(status) {
    const statusObj = this.statusOptions.find((item) => item.value == status);
    return statusObj ? statusObj.label : '';
  }

  getTiming(timing) {
    const timingObj = this.timingOptions.find((item) => item.value == timing);
    return timingObj ? timingObj.label : '';
  }

  getDurationUnit(duration) {
    const durationObj = this.durationUnitOptions.find((item) => item.value == duration);
    return durationObj ? durationObj.label : '';
  }

  getQuantityUnit(quantity) {
    const quantityObj = this.quantityUnitOptions.find((item) => item.value == quantity);
    return quantityObj ? quantityObj.label : '';
  }

  getAllFrequentlyUsedMedicines() {
    this.medicationService.getAllFrequentlyUsedMedicines().subscribe({
      next: (resp: any) => {
        this.frequentlyUsedMedicines = resp.data;
      },
      error: (error) => {
        console.error('Error fetching frequently used medication suggestions:', error);
      }
    });
  }

  searchMedicines(searchParam: string): void {
    this.medicationService.searchMedicines(searchParam.trim()).subscribe({
      next: (response: any) => {
        if (response?.data?.length > 0) {
          const hasExactMatch = response.data.some(
            (item: any) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.medicationSuggestion = hasExactMatch
            ? response.data
            : [...response.data, { label: searchParam, value: searchParam }];
        } else {
          this.medicationSuggestion = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching medication suggestions:', error);
      }
    });
  }

  deleteMedication(medicationId: string): void {

    this.medicationService.deleteMedication(this.patientId(), medicationId).subscribe({
      next: (resp: any) => {
        this.loadMedications();
      },
      error: (error) => {
        console.error('Error deleting medication:', error);
      }
    });
  }

  getTagSeverity(status: number | string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (+status) {
      case 1:
        return 'success';
      case 2:
        return 'info';
      case 3:
        return 'secondary';
      case 4:
        return 'warn';
      case 5:
        return 'danger';
      default:
        return null;
    }
  }

}
