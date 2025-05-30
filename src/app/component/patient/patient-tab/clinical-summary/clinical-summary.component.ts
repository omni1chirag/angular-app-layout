import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrollSpyDirective } from '@directive/scroll-spy.directive';
import { DividerModule } from 'primeng/divider';

import { AllergyListComponent } from "@component/allergy/allergy-list/allergy-list.component";
import { MedicationListComponent } from '@component/medication/medication-list/medication-list.component';
import { PlatformService } from '@service/platform.service';
import { DiagnosisListComponent } from "../../../diagnosis/diagnosis-list/diagnosis-list.component";
import { ActivatedRoute, RouteReuseStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ImmunizationListComponent } from '@component/immunization/immunization-list/immunization-list.component';
import { LabListComponent } from "../../../lab/lab-list/lab-list.component";
import { DocumentListComponent } from "../../../document/document-list/document-list.component";

@Component({
  selector: 'app-clinical-summary',
  imports: [DividerModule,
    CommonModule,
    FormsModule,
    ScrollSpyDirective,
    MedicationListComponent,
    AllergyListComponent,
    DiagnosisListComponent,
    ImmunizationListComponent,
    LabListComponent,
    DocumentListComponent,
    ImmunizationListComponent],
  templateUrl: './clinical-summary.component.html',
  styleUrl: './clinical-summary.component.scss'
})
export class ClinicalSummaryComponent implements OnInit {
  isBrowser: boolean = false;
  reloadKey = true;
  appointmentId;
  patientId;

  constructor(
    private platformService: PlatformService,
    private route: ActivatedRoute
  ) {
    this.isBrowser = platformService.isBrowser();
  }
  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.patientId = this.route.snapshot.params['id'] ?? this.route.parent?.snapshot.params['id'];

    this.route.queryParams
      .pipe(
        filter(params => params['appointmentId'] !== this.appointmentId)
      )
      .subscribe(params => {
        this.appointmentId = params['appointmentId'];
        this.triggerReloadKey();
      });
    this.patientId = this.route.snapshot.params['id'] ?? this.route.parent?.snapshot.params['id'];
  }

  private triggerReloadKey(): void {
    this.reloadKey = false;
    setTimeout(() => this.reloadKey = true, 10);
  }
}