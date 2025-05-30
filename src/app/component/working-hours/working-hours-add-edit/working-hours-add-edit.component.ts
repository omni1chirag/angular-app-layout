import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-working-hours-add-edit',
  imports: [ToolbarModule,
    DividerModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    CommonModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    MultiSelectModule,
    SelectButtonModule,
    DividerModule,
    PageHeaderDirective,
    TranslateModule],
  templateUrl: './working-hours-add-edit.component.html',
  styleUrl: './working-hours-add-edit.component.scss'
})
export class WorkingHoursAddEditComponent implements OnInit {

  isBrowser: boolean = false;
  workingHour: any = {
    practice: 'Practice 1', location: 'Location 1', appointmentType: ['In-person'],
    days: ['Monday'], startTime: '08:00 AM', endTime: '05:00 PM', doubleBooking: 'No', maxBooking: 1,
    slotDurations: '15', breakDuration: '01:00 PM - 02:00 PM', maxAppointmentsPerDay: 1
  };

  practiceOption = [
    { name: 'Practice 1', code: 'Practice 1' },
    { name: 'Practice 2', code: 'Practice 2' },
    { name: 'Practice 3', code: 'Practice 3' },
    { name: 'Practice 4', code: 'Practice 4' },

  ]

  locationOption = [
    { name: 'Location 1', code: 'Location 1' },
    { name: 'Location 2', code: 'Location 2' },
    { name: 'Location 3', code: 'Location 3' },
    { name: 'Location 4', code: 'Location 4' },

  ]
  appointmentTypeOption = [
    { name: 'In-person', code: 'In-person' },
    { name: 'Virtual', code: 'Virtual' },
  ]

  yesNoOption = [
    { name: 'Yes', code: 'Yes' },
    { name: 'No', code: 'No' },
  ]

  daysoptions = [
    { name: 'Monday', value: 'Monday' },
    { name: 'Tuesday', value: 'Tuesday' },
    { name: 'Wednesday', value: 'Wednesday' },
    { name: 'Thursday', value: 'Thursday' },
    { name: 'Friday', value: 'Friday' },
    { name: 'Saturday', value: 'Saturday' },
    { name: 'Sunday', value: 'Sunday' }
  ];

  slotDurations = [
    { "name": "5", "code": "5" },
    { "name": "10", "code": "10" },
    { "name": "15", "code": "15" },
    { "name": "20", "code": "20" },
    { "name": "25", "code": "25" },
    { "name": "30", "code": "30" },
    { "name": "35", "code": "35" },
    { "name": "40", "code": "40" },
    { "name": "45", "code": "45" },
    { "name": "50", "code": "50" },
    { "name": "55", "code": "55" },
    { "name": "60", "code": "60" }
  ]


  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private _router: Router) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngOnInit(): void {
    if (this.isBrowser) {
      const tmp = localStorage.getItem('workingHour');
      this.workingHour = tmp ? JSON.parse(tmp) : this.workingHour;
    }

  }
  navigateTo(route: string) {
    this._router.navigate([route]);
  }
  save() {
    if (this.isBrowser) {
      localStorage.setItem('workingHour', JSON.stringify(this.workingHour))
    }
    this.navigateTo('/home/admin-dashboard');
  }

  cancel() {
    this.navigateTo('/home/admin-dashboard');
  }
}
