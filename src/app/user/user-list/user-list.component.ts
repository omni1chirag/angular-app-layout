import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { UserService } from '../../service/user.service';
import { Subscription } from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { PageHeaderDirective } from '../../directive/page-header.directive';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TableAutoScrollDirective } from '../../directive/table-auto-scroll.directive';

export interface User {
  userName: string;
  userType: string;
  practiceName: string;
  organizationName: string;
  status: string;
}
@Component({
  selector: 'app-user-list',
  imports: [ButtonModule,
            ToolbarModule,
            TableModule,
            CommonModule,
            FormsModule,
            SelectModule,
            TagModule,
            MenuModule,
            DividerModule,
            PageHeaderDirective,
            ToggleButtonModule,
            TableAutoScrollDirective
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  providers: [MessageService]
})
export class UserListComponent {
  users!: User[];
  @ViewChild('filter') filter!: ElementRef;
  selecteduser: User[] = [];
  actions: boolean = false;
  isBrowser: boolean;
  statusList: any[] = [];
  optionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-pen-to-square',
          // command: () => this.openApprovalConfirmation()
        },
      ]
    }
  ];


  constructor(private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId); 
  }

  ngOnInit() {  
    this.userService.getClientMedium().then(data => {
      this.users = data;
    });
    this.userService.getClientMedium().then((users) => (this.users = users)).catch(
    (error) => console.error('Error fetching users',error));

    this.statusList = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' }
    ];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  showToaster(detail:string, severity:string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }

  onSelectionChange() {
    console.log('🔄 Selection Changed:',  this.selecteduser);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  }

}
