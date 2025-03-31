import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../../directive/page-header.directive';
import { Appointment,practiceList,appointmentTypeOption,providerList,reasonForVisits } from '../appointment.model';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-add-edit-appointment',
  imports: [ToolbarModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    DividerModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    TextareaModule,
    SelectButtonModule,
    AutoCompleteModule,
    DividerModule,
    PageHeaderDirective,
    TranslateModule
  ],
  templateUrl: './add-edit-appointment.component.html',
  styleUrl: './add-edit-appointment.component.scss'
})
export class AddEditAppointmentComponent {
  isBrowser: boolean = false;
  appointment: Appointment = new Appointment({});
  patientSuggestions: any[] = []
 
  practiceList =practiceList;
  appointmentTypeOption =appointmentTypeOption
  providerList =providerList
  reasonForVisits =reasonForVisits

  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private _router: Router) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const tmp = localStorage.getItem('appointment');
      this.appointment = tmp ? new Appointment( JSON.parse(tmp)) : this.appointment;
    }

  }
  searchPatientName(event: AutoCompleteCompleteEvent) {
    if (event.query.length < 3) return;
    this.patientSuggestions = [...Array(10).keys()].map(item => { return { name: (event.query + '-' + item), code: (event.query + '-' + item) } });
  }
  setDuration($event,isFirst?:boolean) {
    if(isFirst){
      let enddate = new Date(this.appointment.startTime);
      enddate.setMinutes(new Date(this.appointment.startTime).getMinutes() + 15)
      this.appointment.endTime = enddate;
    }    
    this.appointment.duration = this.getDurationString([this.appointment.startTime, this.appointment.endTime]);
  }
  getDurationString(dates: Date[]): number {
    const start = new Date(dates[0]);
    const end = new Date(dates[1]);
    const diffInMs = end.getTime() - start.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  save() {
    if (this.isBrowser) {
      const currentListString: string = localStorage.getItem('appointments') || '[]';
      let list: any[] = JSON.parse(currentListString);
      list = list.filter((item) => item.appointmentId !== this.appointment.appointmentId);
      list.push(this.appointment);
      localStorage.setItem('appointments', JSON.stringify(list))
      localStorage.removeItem('appointment');
    }
    this.navigateTo('/home/appointment/list')
  }
  cancel() {
    localStorage.removeItem('appointment');
    this.navigateTo('/home/appointment/list')
  }
}
