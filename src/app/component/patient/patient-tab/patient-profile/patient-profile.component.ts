import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientInsuranceListComponent } from '@component/patient-insurance/patient-insurance-list/patient-insurance-list.component';
import { ToolbarModule } from 'primeng/toolbar';
import { PatientAddEditComponent } from "../../patient-add-edit/patient-add-edit.component";
import { ScrollSpyDirective } from '@directive/scroll-spy.directive';

@Component({
  selector: 'app-patient-profile',
  imports: [
    ToolbarModule,
    ReactiveFormsModule,
    CommonModule,
    PatientInsuranceListComponent,
    ScrollSpyDirective,
    PatientAddEditComponent,
],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.scss'
})
export class PatientProfileComponent {

}
