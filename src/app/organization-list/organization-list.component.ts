import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { OrganizationService } from '../service/organization.service';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { DividerModule } from 'primeng/divider';
import { TableAutoScrollDirective } from '../directive/table-auto-scroll.directive';

export interface Organization {
  organizationName: string;
  typeOfOrganization: string;
  subscriptionPlan: string;
  status: string;
}

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [TableModule, 
            CommonModule, 
            ToggleButtonModule,
            FormsModule,
            ButtonModule,
            ToolbarModule,                                    
            SelectModule,            
            MenuModule,
            TagModule,
            PageHeaderDirective,
            DividerModule,
            TableAutoScrollDirective
            ],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService]
})
export class OrganizationListComponent {

  organizations!: Organization[];
  actions: boolean = true;
  @ViewChild('filter') filter!: ElementRef;
  displayApproveConfirmation: boolean = false;
  displayRejectConfirmation: boolean = false;
  selectedOrganzation: Organization[] = [];
  isBrowser: boolean;
  statusList: any[] = [];

  optionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-pen-to-square',
          // command: () => this.openApprovalConfirmation()
        }
      ]
    }
  ];

  constructor(private messageService: MessageService,
              private organizationService: OrganizationService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.organizationService.getClientMedium().then(organizations => this.organizations = organizations);

    this.statusList = [
      { label: 'Active', value: 'Active' },
      { label: 'InActive', value: 'InActive' },
  ];
  }
  
  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  showToaster(detail:string, severity:string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  onSelectionChange() {
    console.log('🔄 Selection Changed:',  this.selectedOrganzation);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }
}
