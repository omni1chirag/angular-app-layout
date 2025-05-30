import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DiagnosisService } from '@service/diagnosis.service';
import { MasterService } from '@service/master.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { DiagnosisAddEditComponent } from '../diagnosis-add-edit/diagnosis-add-edit.component';
import { TagModule } from 'primeng/tag';
import { LabelValue } from '@interface/common-master.interface';
import { PlatformService } from '@service/platform.service';

@Component({
  selector: 'app-diagnosis-list',
  imports: [TranslateModule,
    DividerModule,
    AutoCompleteModule,
    ButtonModule,
    CommonModule,
    TableModule,
    TagModule,
    DiagnosisAddEditComponent
  ],
  templateUrl: './diagnosis-list.component.html',
  styleUrl: './diagnosis-list.component.scss'
})

export class DiagnosisListComponent implements OnInit {

  visible: boolean = false;
  selectedDiagnosis = signal<any>(null);
  diagnosisSuggestion: LabelValue[] = [];
  frequentlyUsedDiagnosis: LabelValue[] = []
  diagnosisList: any[] = [];
  statusOptions: LabelValue[] = [];
  isBrowser: boolean = false;
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  rowsPerPage = 10;

  constructor(private diagnosisService: DiagnosisService,
    private masterService: MasterService,
    private platformService: PlatformService
  ) {
    this.isBrowser = platformService.isBrowser();
    if (!this.isBrowser) return;

    this.initializeMasterData();
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    this.loadDiagnosis();
  }

  loadDiagnosis(event?: any) {

    const apiCall = this.appointmentId() 
    ? this.diagnosisService.getAllDiagnosis(this.patientId(), this.appointmentId())
    : this.diagnosisService.getAllDiagnosis(this.patientId());

    apiCall.subscribe({
      next: (response: any) => {
        this.diagnosisList = response?.data;
      },
      error: (error) => {
        console.error('Error fetching diagnosis:', error);
      }
    });

  }

  initializeMasterData() {

    const params = ['DIAGNOSIS_STATUS'];

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'DIAGNOSIS_STATUS':
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

    this.getAllFrequentlyUsedDiagnosis();
  }

  searchDiagnosis(searchParam: any): void {

    this.diagnosisService.searchDiagnosis(searchParam).subscribe({
      next: (response: any) => {
        if (response?.data?.length > 0) {
          this.diagnosisSuggestion = response?.data;
        } else {
          this.diagnosisSuggestion = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching diagnosis suggestions:', error);
      }
    });

  }

  getAllFrequentlyUsedDiagnosis(): void {
    this.diagnosisService.getAllFrequentlyUsedDiagnosis().subscribe({
      next: (response: any) => {
        this.frequentlyUsedDiagnosis = response?.data;
      },
      error: (error) => {
        console.error('Error fetching frequently used diagnosis:', error);
      }
    });
  }

  addDiagnosis(diagnosisObj: any): void {
    this.visible = true;
    const diagnosis = {
      diagnosisName: diagnosisObj?.value
    };
    this.selectedDiagnosis.set(diagnosis);
  }

  editDiagnosis(diagnosis: any): void {
    this.visible = true;
    this.selectedDiagnosis.set(diagnosis);
  }

  removeDiagnosis(index: number, item?: any): void {
    this.diagnosisList.splice(index, 1);
    this.deleteDiagnosis(item.diagnosisId);
  }

  deleteDiagnosis(diagnosisId: any): void {

    this.diagnosisService.deleteDiagnosis(this.patientId(), diagnosisId).subscribe({
      next: (response: any) => {
        this.loadDiagnosis();
      },
      error: (error) => {
        console.error('Error deleting diagnosis:', error);
      }
    });
  }

  getStatus(status) {
    const statusObj = this.statusOptions.find((item) => item.value == status);
    return statusObj ? statusObj.label : '';
  }

  getTagSeverity(status: number | string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (status) {
      case 1:  // Active
        return 'success';
      case 2:  // Resolved
        return 'info';
      case 3:  // Chronic
        return 'secondary';
      case 4:  // Recurring
        return 'warn';
      case 5:  // In Remission
        return 'info';
      case 6:  // Worsening
        return 'warn';
      case 7:  // Improving
        return 'success';
      case 8:  // Unknown
        return 'contrast';
      case 9:  // Complicated
        return 'danger';
      case 10: // Unstable
        return 'danger';
      case 11: // Inactive
        return 'secondary';
      case 12: // Ruled Out
        return 'info';
      case 13: // Undiagnosed
        return 'contrast';
      default:
        return null;
    }     
  }

}
