import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SvgIconDirective } from '@directive/svg-icon.directive';

interface mapPractices{
  name: string;
  code: string;
}
@Component({
  selector: 'app-provider-dashboard',
  imports: [CommonModule,FormsModule,  SelectModule, SvgIconDirective],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent {
  practice: any = null;
  practices: mapPractices[] = [
    {name: 'General Physician', code: 'General Physician'},
    {name: 'Wrapper', code: 'Wrapper'},
    {name: 'Rau Cardio', code: 'Rau Cardio'},
    {name: 'Blossom', code: 'Blossom'},
    {name: 'Full Moon', code: 'Full Moon'},
  ];
}
