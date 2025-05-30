import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PatientInsuranceService } from '@service/patient-insurance.service';
import { PlatformService } from '@service/platform.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PatientInsuranceAddEditComponent } from '../patient-insurance-add-edit/patient-insurance-add-edit.component';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-patient-insurance-list',
  imports: [TableModule,
    CommonModule,
    ButtonModule,
    AccordionModule,
    PatientInsuranceAddEditComponent,
    TranslateModule,
    DividerModule,
    MenuModule,
    TagModule],
  templateUrl: './patient-insurance-list.component.html',
  styleUrl: './patient-insurance-list.component.scss'
})
export class PatientInsuranceListComponent implements OnInit {
  isBrowser: boolean = false;
  patientInsurances: any[] = [];
  patientId: string;
  isPatientInsuranceVisible: boolean = false;
  patientInsuranceId;
  optionsItems = [{ label: 'EDIT', icon: 'pi pi-pen-to-square' }, { label: 'STATUS', icon: 'pi pi-times-circle' }];

  constructor(
    private platformService: PlatformService,
    private patientInsuranceService: PatientInsuranceService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.isBrowser = platformService.isBrowser();
  }
  ngOnInit(): void {
    const { params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    if(!this.patientId){
      const { params } = this.activatedRoute.parent?.snapshot;
      this.patientId = params['id'];
    }
    this.loadPatientInsurances()
  }

  loadPatientInsurances($event?) {
    this.isPatientInsuranceVisible = false;
    this.patientInsuranceService.getAllPatientInsurance(this.patientId).subscribe((response: any) => {
      this.patientInsurances = response.data;
    });
  }

  addEditPatientInsurance(patientInsuranceId?) {
    this.patientInsuranceId = patientInsuranceId;
    this.isPatientInsuranceVisible = true;
  }

  updateStatus(patientInsuranceId, status) {
    this.patientInsuranceService.updatePatientInsuranceStatus(this.patientId, patientInsuranceId, { status }).subscribe((resp: any) => {
      this.loadPatientInsurances()
    });
  }

}
