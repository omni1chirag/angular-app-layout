import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { PatientMenuComponent } from "./patient-menu/patient-menu.component";
@Component({
  selector: 'app-patient-tab',
  imports: [
    ToolbarModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    PatientMenuComponent
  ],
  templateUrl: './patient-tab.component.html',
  styleUrl: './patient-tab.component.scss'
})
export class PatientTabComponent implements OnInit, OnDestroy {
  isBrowser: boolean = false;
  patientId: string;
  patientInfo: any;

  constructor(private patientService: PatientService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private platformService: PlatformService) {
    this.isBrowser = platformService.isBrowser();
  }
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    const { params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    console.log('patientId in patient-tab :', this.patientId);
    this.patientService.getPatientBasicInfo(this.patientId).subscribe({
      next: ({ data, message }) => { this.patientInfo = data; },
      error: (error) => { this.cancel() }
    })
  }

  cancel() {
    this.router.navigateByUrl('/home/patient/list');
  }

}
