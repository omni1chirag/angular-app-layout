import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { InsuranceModel } from '@model/insurance.model';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';
import { InsuranceAddEditComponent } from "../insurance-add-edit/insurance-add-edit.component";
import { PatientInsuranceService } from '@service/patient-insurance.service';

@Component({
  selector: 'app-insurance-list',
  imports: [ToolbarModule, TranslateModule, ButtonModule, TableModule, CommonModule, TagModule, MenuModule, Divider, InsuranceAddEditComponent, TranslateModule, ...GLOBAL_CONFIG_IMPORTS,],
  templateUrl: './insurance-list.component.html',
})
export class InsuranceListComponent implements OnInit {
  private readonly platformService = inject(PlatformService);
  private readonly patientInsuranceService = inject(PatientInsuranceService);
  mode: 'add-insurance' | 'update' = 'update';
  insurances: InsuranceModel[] = [];
  optionsItems = [{ label: 'EDIT', icon: 'pi pi-pen-to-square' }, { label: 'STATUS', icon: 'pi pi-times-circle' }];
  first = 0;
  totalRecords = 0;
  size = 10;
  showLoader = true;
  isBrowser: boolean;
  patientId = input<string>('');
  visible = signal<boolean>(false);
  patientInsuranceId: string;

  ngOnInit(): void {
    this.platformService.onBrowser(() => {
      console.debug('patient in insurance list:', this.patientId());
    });
  }

  createInsuance(): void {
    console.debug('Create insurance clicked');
  }

  addInsurance(): void {
    this.patientInsuranceId = null;
    this.visible.set(true);
  }

  editInsurance(patientInsuranceId: string | null): void {
    this.patientInsuranceId = patientInsuranceId;
    this.visible.set(true);
  }

  updateStatus(patientInsuranceId: string, status: number): void {
    if (!patientInsuranceId || status === null) {
      console.error('Patient Insurance ID is null');
      return;
    }
    this.showLoader = true;
    this.patientInsuranceService.updatePatientInsuranceStatus(this.patientId(), patientInsuranceId, status).subscribe(() => {
      this.loadPatientInsurances()
    });
  }

  initializeInsuraces(): void {
    this.platformService.onBrowser(() => {
      this.patientInsuranceId = null;
      this.visible.set(false);
      this.loadPatientInsurances();
    });
  }
  loadPatientInsurances(): void {
    this.patientInsuranceService.getAllPatientInsurance(this.patientId()).subscribe({
      next: (res) => { this.insurances = res as InsuranceModel[]; },
      error: (err) => { console.error('Error while fetching insurances', err); },
      complete: () => { this.showLoader = false; }
    });
  }

}
