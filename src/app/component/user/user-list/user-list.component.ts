import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { UserService } from '@service/user.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { MasterService } from '@service/master.service';
interface LabelValue {
  label: string;
  value: any;
}

@Component({
  selector: 'app-user-list',
  imports: [ButtonModule,
    ReactiveFormsModule,
    ToolbarModule,
    TableModule,
    SelectModule,
    CommonModule,
    FormsModule,
    PaginatorModule,
    SelectModule,
    TagModule,
    MenuModule,
    DividerModule,
    PageHeaderDirective,
    ToggleButtonModule,
    AutoCompleteModule,
    TableAutoScrollDirective,
    SelectButtonModule,
    TooltipModule,
    MultiSelectModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {

  @ViewChild('userTable') dt: Table;
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 150;
  showLoader = true;
  users!: any[];
  clinics: LabelValue[] = [];
  organizations: LabelValue[] = [];
  statuses: LabelValue[] = [];
  roles: LabelValue[] = [];
  userSuggestions: LabelValue[] = [];
  actions: boolean = true;
  isBrowser: boolean;
  optionsItems = [{ label: 'Edit', icon: 'pi pi-pen-to-square' }, { label: 'status', icon: 'pi pi-times-circle' }];

  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }

  constructor(private router: Router,
    private userService: UserService,
    private masterService: MasterService, 
    private notificationService: NotificationService,
    private platformService: PlatformService,
  ) {
    this.isBrowser = platformService.isBrowser();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.onResize();
    }
    this.initializeMasterData();
  }

  initializeMasterData() {
    this.userService.getOrganizationLabels().subscribe((resp: any) => {
      this.organizations = resp.data;
    });
    this.userService.getRoleLabels().subscribe((resp: any) => {
      this.roles = resp.data;
    })
    const params = ['STATUS']
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'STATUS':
            this.statuses = [{ label: 'All', value: 3 }, ...res.value]
            break;
          default:
            console.log('name not found', res.name);
            break;
        }
      })
    });
  }

  searchUsers($event: AutoCompleteCompleteEvent) {
    const query = $event.query;
    if (query && query.length > 2) {
      this.userService.searchUsers(query).subscribe((resp: any) => {
        this.userSuggestions = resp.data;
      });
    }
  }

  setClinics(organizationId, filter) {
    this.dt.filters['clinic']['value'] = undefined;
    filter(organizationId);
    if (!organizationId) {
      this.clinics = [];
      return;
    }
    this.userService.getClinicLabels(organizationId).subscribe((resp: any) => {
      this.clinics = resp.data;
    })
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  editUser(user) {
    this.navigateTo(`/home/user/${user.userId}/edit`);
  }

  updateStatus(userId, status) {
    this.userService.updateUserStatus(userId, { status }).subscribe((resp: any) => {
      this.notificationService.showSuccess(resp.message);
      this.dt.clear()
    });
  }

  loadUsers($event) {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;

    let params = new HttpParams();
    const filter = $event.filters;
    if (filter) {
      if (filter.user?.value) {
        params = params.append('user', filter.user.value);
      }
      if (filter.role?.value) {
        filter.role.value.forEach((role) => {
          params = params.append('role', role);
        })
      }
      if (filter.organization?.value) {
        params = params.append('organization', filter.organization.value);
      }
      if (filter.clinic?.value) {
        filter.clinic?.value.forEach((clinic) => {
          params = params.append('clinic', clinic);
        })
      }
      if (filter.status?.value == undefined) {
        filter.status = {
          value: 'All'
        }
      }
      if (filter.status?.value && filter.status?.value != 'All') {
        params = params.append('status', filter.status.value);
      }
    }

    ([{ field: 'name', order: 1 }])?.forEach((sort) => {
      let field = sort.field;
      let order = sort.order;
      params = params.append('sort', (field + ' ' + (order == 1 ? 'asc' : 'desc')));
    });
    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows);

    this.userService.getUsers(params).subscribe({
      next: (resp: any) => {
        this.users = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
        this.notificationService.showError(error)
      }
    }
    );
  }
}
