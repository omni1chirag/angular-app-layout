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
import { PageHeaderDirective } from '../../directive/page-header.directive';

@Component({
  selector: 'app-add-edit-notification',
  imports: [ToolbarModule, 
    DividerModule, 
    FormsModule, 
    InputTextModule, 
    DatePickerModule, 
    ButtonModule, 
    CommonModule, 
    SelectModule, 
    TextareaModule, 
    SelectButtonModule,
    DividerModule,
    PageHeaderDirective,
    TranslateModule
  ],
  templateUrl: './add-edit-notification.component.html',
  styleUrl: './add-edit-notification.component.scss'
})
export class AddEditNotificationComponent implements OnInit {

  notification: {
    name: string;
    type?: string;
    audience?: string;
    trigger?: string;
    datetime: string;
    status: string;
    message: string;
    modifiedBy?: string;
    modifiedOn?: string;
    createdOn?: string;
    createdBy?: string;
  } =
    {
      name: '',
      type: undefined,
      audience: undefined,
      trigger: undefined,
      datetime: '',
      status: 'Active',
      message: ''
    };

  isBrowser: boolean = false;
  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private _router: Router) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('notification');
      if (data) {
        this.notification = JSON.parse(data);
      }
    }
  }

  eventType = [
    { name: 'System Alert', code: 'System Alert' },
    { name: 'Email', code: 'Email' },
    { name: 'SMS', code: 'SMS' },
    { name: 'Push Notification', code: 'Push Notification' },

  ];
  targetAudience = [
    { name: 'Admin', code: 'Admin' },
    { name: 'Provider', code: 'Provider' },
    { name: 'Patient', code: 'Patient' },
    { name: 'All Users', code: 'All Users' },

  ];
  TriggerTime = [
    { name: 'On Event', code: 'On Event' },
    { name: 'Scheduled', code: 'Scheduled' },
    { name: 'Recurring', code: 'Recurring' }

  ];

  stateOptions = [
    { name: 'Active', code: 'Active' },
    { name: 'Inactive', code: 'Inactive' }
  ];

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  save() {
    if (this.isBrowser) {
      try {
        const currentListString: string = localStorage.getItem('notifications') || '[]';
        const list: any[] = JSON.parse(currentListString);
        list.push(this.notification);
        localStorage.setItem('notifications', JSON.stringify(list))
        localStorage.removeItem('notification');
      } catch (error) {
  
      }
    }
    this.navigateTo('/home/notification/list')
  }

  cancel() {
    localStorage.removeItem('notification');
    this.navigateTo('/home/notification/list')
  }
}


