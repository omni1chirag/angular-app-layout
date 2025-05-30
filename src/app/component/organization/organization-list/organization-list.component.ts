import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { DividerModule } from 'primeng/divider';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { OrganizationService } from '@service/organization.service';
import { Organization } from '@model/organization.model';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { NotificationService } from '@service/notification.service';
import { HttpParams } from '@angular/common/http';
import { SubscriptionPlan } from '@model/subscription.model';
import { SubscriptionService } from '@service/subscription.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { PlatformService } from '@service/platform.service';

interface LabelValue {
  label: string;
  value: any;
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
    TableAutoScrollDirective,
    AutoCompleteModule,
    MultiSelectModule
  ],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService]
})
export class OrganizationListComponent {

  @ViewChild('organizationTable') dt: Table;
  organizations!: Organization[];
  freezeActions: boolean = true;
  freezeOrganizationName: boolean = false;
  @ViewChild('filter') filter!: ElementRef;
  displayApproveConfirmation: boolean = false;
  displayRejectConfirmation: boolean = false;
  selectedOrganzation: Organization[] = [];
  isBrowser: boolean;
  statusList: any[] = [];
  organizationSuggestions: LabelValue[] = [];
  subscriptionPlanOptions: SubscriptionPlan[];
  defaultSortField: string = 'organizationName';
  defaultSortOrder: number = 1;

  size = 50;
  totalRecords = 0;
  showLoader = false;
  first = 0;

  actionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-pen-to-square',
        },
        {
          label: 'Activate',
          icon: 'pi pi-check-circle',
        },
        {
          label: 'Deactivate',
          icon: 'pi pi-times-circle',
        },
        {
          label: 'Add Clinic',
          icon: 'pi pi-plus',
        }
      ]
    }
  ];

  constructor(private notificationService: NotificationService,
    private subscriptionService: SubscriptionService,
    private platformService: PlatformService,
    private router: Router,
    private organizationService: OrganizationService,
  ) {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.statusList = [
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'InActive', value: 'INACTIVE' }
      ];
      this.getDefaultSubscriptionPlan();
    }
  }

  clear(table: Table) {
    table.clear();
    if (this.filter.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getDefaultSubscriptionPlan() {
    this.subscriptionService.getDefaultSubscriptions().subscribe((data: SubscriptionPlan[]) => {
      this.subscriptionPlanOptions = data;
    })
  }


  onSelectionChange() {
    console.log('🔄 Selection Changed:', this.selectedOrganzation);
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

  navigateTo(route: string, params?: any) {
    if (params) {
      this.router.navigate([route], { queryParams: params });
    } else {
      this.router.navigate([route]);
    }
  }

  editOrganization(id?: string) {
    const url = `/home/organization/${id}/edit`;
    this.navigateTo(url);
  }

  addPractice(id?: string) {
    const url = `/home/practice/add`;
    const params = { organizationId: id }
    console.log('params:', params);
    this.navigateTo(url, params);
  }


  searchOrganizations($event: AutoCompleteCompleteEvent) {
    const query = $event.query;
    if (query && query.length > 2) {
      this.organizationService.searchOrganizations(query).subscribe({
        next: (resp: any) => {
          this.organizationSuggestions = resp.data;
        },
        error: (error) => {
          console.error('Error searching organizations:', error);
          this.notificationService.showError('Error searching organizations');
        }
      });
    }
  }

  loadOrganziations($event) {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;
    let params = new HttpParams();
    const filter = $event.filters;

    if (filter) {
      if (filter.organizationName?.value) {
        params = params.append('organization', filter.organizationName.value);
      }

      if (!filter.status?.value) {
        filter.status = {
          value: 'ACTIVE',
          matchMode: "equals"

        };
      }
      params = params.append('status', filter.status.value);


      if (filter.subscriptionPlanName?.value) {
        filter.subscriptionPlanName.value.forEach((subscriptionPlan) => {
          params = params.append('subscriptionPlan', subscriptionPlan);
        })
      }
    }

    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows)

    this.organizationService.getOrganizations(params).subscribe({
      next: (resp: any) => {
        this.organizations = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        console.error('Error While Fetching organizations:', error);
        this.showLoader = false;
        this.notificationService.showError('Error While Fetching organizations');
      }
    });
  }

  updateStatus(id: string, status: string) {
    this.organizationService.updateOrganizationStatus(id, status).subscribe({
      next: (resp: any) => {
        this.notificationService.showSuccess(resp.message);
        this.dt.clear();
      },
      error: (error) => {
        console.error('Error updating organization status:', error);
        this.notificationService.showError('Error updating organization status');
      }
    });

  }
}
