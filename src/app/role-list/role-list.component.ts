import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { RoleService } from '../service/role.service';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DividerModule } from 'primeng/divider';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { TableAutoScrollDirective } from '../directive/table-auto-scroll.directive';


export interface Role {
  roleName: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  status: string;
}
@Component({
  selector: 'app-role-list',
  imports: [ButtonModule,
            ToolbarModule,
            TableModule,
            CommonModule,
            SelectModule,
            TagModule,
            FormsModule,
            MenuModule,
            ToggleButtonModule,
            DividerModule,
            PageHeaderDirective,
            TableAutoScrollDirective

  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
  providers: [MessageService]
})
export class RoleListComponent {
  roles!: Role[];
  @ViewChild('filter') filter!: ElementRef;
  selectedRole: Role[] = [];
  statusList: any[] = [];
  actions: boolean = false;
  isBrowser: boolean;
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
              private roleService: RoleService,
              @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(platformId)
   }

   ngOnInit() {
    this.roleService.getrolemedium().then(data => this.roles = data);

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
    console.log('🔄 Selection Changed:',  this.selectedRole);
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
