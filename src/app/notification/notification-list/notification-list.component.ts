import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { log } from 'console';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../../directive/page-header.directive';
import { TableAutoScrollDirective } from '../../directive/table-auto-scroll.directive';


@Component({
  selector: 'app-notification-list',
  imports: [TableModule, 
    DividerModule, 
    FormsModule, 
    ButtonModule, 
    ToggleButtonModule, 
    ToolbarModule, 
    MenuModule, 
    CommonModule, 
    TagModule, 
    SelectModule,
    DividerModule,
    PageHeaderDirective,
    TableAutoScrollDirective
    ],
  providers: [MessageService],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  actions: boolean = false;
  isBrowser: boolean = false;

  notifications: Array<Notification> = [];
  cols!: Column[];
  optionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-check-circle'
        },
        {
          label: 'Deactivate',
          icon: 'pi pi-times-circle'
        }
      ]
    }
  ];

  stateOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  eventType = [
    { name: 'System Alert', code: 'System Alert' },
    { name: 'Email', code: 'Email' },
    { name: 'SMS', code: 'SMS' },
    { name: 'Push Notification', code: 'Push Notification' },

  ];
  eventList: any = []

  constructor(private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: object,
    private _router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'type', header: 'Type' },
      { field: 'specialty', header: 'Specialty', customExportHeader: 'Provider Specialty' },
      { field: 'status', header: 'Status' }
    ];


  }
  ngOnInit(): void {
    const currentListString: string = localStorage.getItem('notifications') || '[]';
    this.notifications = JSON.parse(currentListString);
    this.notifications = [...this.notifications, ...externalNotifications]
    this.notifications.forEach((notification) => {
      notification.modifiedBy = 'Admin, User'
      notification.modifiedOn = 'Sun Mar 20 2024 05:30:00 GMT+0530 (India Standard Time)'
      notification.createdOn = 'Sun Mar 15 2020 05:30:00 GMT+0530 (India Standard Time)'
      notification.createdBy = 'Admin, User'
      this.eventList.push({ name: notification.name, code: notification.name });
    })
  }

  clear(table: Table) {
    table.clear();
  }
  showToaster(detail: string, severity: string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }
  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }

  addEditMode(notification?: Notification) {
    if (notification && isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('notification', JSON.stringify(notification))
      } catch (error) {
        console.log(error);

      }
    }
    this.navigateTo('/home/notification/add-edit');

  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }
}

export interface Notification {
  name: string;
  type: string;
  audience: string;
  trigger: string;
  datetime: string;
  status: string;
  message: string;
  modifiedBy?: string;
  modifiedOn?: string;
  createdOn?: string;
  createdBy?: string;
}

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

export const externalNotifications: Array<Notification> = [
  {
    "name": "Alert Record 1",
    "type": "System Alert",
    "audience": "Admin",
    "trigger": "On Event",
    "datetime": "2025-03-20T00:00:00.000Z",
    "status": "Active",
    "message": "This is an alert for System Alert for Admin. Trigger: On Event."
  },
  {
    "name": "Alert Record 2",
    "type": "Email",
    "audience": "Provider",
    "trigger": "Scheduled",
    "datetime": "2025-03-20T00:10:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Email for Provider. Trigger: Scheduled."
  },
  {
    "name": "Alert Record 3",
    "type": "SMS",
    "audience": "Patient",
    "trigger": "Recurring",
    "datetime": "2025-03-20T00:20:00.000Z",
    "status": "Active",
    "message": "This is an alert for SMS for Patient. Trigger: Recurring."
  },
  {
    "name": "Alert Record 4",
    "type": "Push Notification",
    "audience": "All Users",
    "trigger": "On Event",
    "datetime": "2025-03-20T00:30:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Push Notification for All Users. Trigger: On Event."
  },
  {
    "name": "Alert Record 5",
    "type": "System Alert",
    "audience": "Admin",
    "trigger": "Scheduled",
    "datetime": "2025-03-20T00:40:00.000Z",
    "status": "Active",
    "message": "This is an alert for System Alert for Admin. Trigger: Scheduled."
  },
  {
    "name": "Alert Record 6",
    "type": "Email",
    "audience": "Provider",
    "trigger": "Recurring",
    "datetime": "2025-03-20T00:50:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Email for Provider. Trigger: Recurring."
  },
  {
    "name": "Alert Record 7",
    "type": "SMS",
    "audience": "Patient",
    "trigger": "On Event",
    "datetime": "2025-03-20T01:00:00.000Z",
    "status": "Active",
    "message": "This is an alert for SMS for Patient. Trigger: On Event."
  },
  {
    "name": "Alert Record 8",
    "type": "Push Notification",
    "audience": "All Users",
    "trigger": "Scheduled",
    "datetime": "2025-03-20T01:10:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Push Notification for All Users. Trigger: Scheduled."
  },
  {
    "name": "Alert Record 9",
    "type": "System Alert",
    "audience": "Admin",
    "trigger": "Recurring",
    "datetime": "2025-03-20T01:20:00.000Z",
    "status": "Active",
    "message": "This is an alert for System Alert for Admin. Trigger: Recurring."
  },
  {
    "name": "Alert Record 10",
    "type": "Email",
    "audience": "Provider",
    "trigger": "On Event",
    "datetime": "2025-03-20T01:30:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Email for Provider. Trigger: On Event."
  },
  {
    "name": "Alert Record 11",
    "type": "SMS",
    "audience": "Patient",
    "trigger": "Scheduled",
    "datetime": "2025-03-20T01:40:00.000Z",
    "status": "Active",
    "message": "This is an alert for SMS for Patient. Trigger: Scheduled."
  },
  {
    "name": "Alert Record 12",
    "type": "Push Notification",
    "audience": "All Users",
    "trigger": "Recurring",
    "datetime": "2025-03-20T01:50:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Push Notification for All Users. Trigger: Recurring."
  },
  {
    "name": "Alert Record 13",
    "type": "System Alert",
    "audience": "Admin",
    "trigger": "On Event",
    "datetime": "2025-03-20T02:00:00.000Z",
    "status": "Active",
    "message": "This is an alert for System Alert for Admin. Trigger: On Event."
  },
  {
    "name": "Alert Record 14",
    "type": "Email",
    "audience": "Provider",
    "trigger": "Scheduled",
    "datetime": "2025-03-20T02:10:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Email for Provider. Trigger: Scheduled."
  },
  {
    "name": "Alert Record 15",
    "type": "SMS",
    "audience": "Patient",
    "trigger": "Recurring",
    "datetime": "2025-03-20T02:20:00.000Z",
    "status": "Active",
    "message": "This is an alert for SMS for Patient. Trigger: Recurring."
  },
  {
    "name": "Alert Record 16",
    "type": "Push Notification",
    "audience": "All Users",
    "trigger": "On Event",
    "datetime": "2025-03-20T02:30:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Push Notification for All Users. Trigger: On Event."
  },
  {
    "name": "Alert Record 17",
    "type": "System Alert",
    "audience": "Admin",
    "trigger": "Scheduled",
    "datetime": "2025-03-20T02:40:00.000Z",
    "status": "Active",
    "message": "This is an alert for System Alert for Admin. Trigger: Scheduled."
  },
  {
    "name": "Alert Record 18",
    "type": "Email",
    "audience": "Provider",
    "trigger": "Recurring",
    "datetime": "2025-03-20T02:50:00.000Z",
    "status": "Inactive",
    "message": "This is an alert for Email for Provider. Trigger: Recurring."
  },
  {
    "name": "Alert Record 19",
    "type": "SMS",
    "audience": "Patient",
    "trigger": "On Event",
    "datetime": "2025-03-20T03:00:00.000Z",
    "status": "Active",
    "message": "This is an alert for SMS for Patient. Trigger: On Event."
  }
]
