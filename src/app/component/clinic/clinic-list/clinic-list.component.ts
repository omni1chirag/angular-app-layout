import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { DividerModule } from 'primeng/divider';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { HttpParams } from '@angular/common/http';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { ClinicService } from '@service/clinic.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';

interface LabelValue {
  label: string;
  value: any;
}

@Component({
  selector: 'app-clinic-list',
  imports: [
    ToggleButtonModule,
    ToolbarModule,
    TableModule,
    CommonModule,
    SelectModule,
    FormsModule,
    ButtonModule,
    TagModule,
    MenuModule,
    ToastModule,
    RouterModule,
    AutoCompleteModule,
    PageHeaderDirective,
    DividerModule,
    TableAutoScrollDirective,
    SelectButtonModule,
    MultiSelectModule
  ],
  templateUrl: './clinic-list.component.html',
  providers: [MessageService]
})
export class clinicListComponent {
  @ViewChild('clinicTable') dt: Table;
  clinics!: any[];
  isBrowser: boolean;
  actions: boolean = true;
  statuses: LabelValue[] = [];
  organizations: LabelValue[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 150;
  showLoader = true;
  clinicSuggestions: LabelValue[] = [];
  specialities: LabelValue[] = [];
  selectedClinic: any;
  cols: any[] = [

    { field: 'clinicName', header: 'Clinic Name' },

    { field: 'organizationName', header: 'Organization Name' },

    { field: 'speciality', header: 'Speciality' },

    { field: 'state', header: 'State' },

    { field: 'status', header: 'Status' }

];
  optionsItems = [
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
        label: 'Add Doctor',
        icon: 'pi pi-plus',
      }
  ];
  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }
  constructor(
    private clinicService: ClinicService,
    @Inject(PLATFORM_ID) private platformId: object,
    private messageService: MessageService,
    private masterService: MasterService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.initializeMasterData();
    if (this.isBrowser) {
      this.onResize();
    }
    
  }

  showToaster(detail: string, severity: string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  initializeMasterData(){
    this.clinicService.getOrganizationLabels().subscribe((resp: any) => {
      this.organizations = resp.data;
    });
    this.masterService.getSpeciality().subscribe((resp: any) => {
      this.specialities = resp.data;
    });
    const params = ['STATUS']
    this.masterService.getCommonMasterData(params).subscribe((resp:any) => {
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

  editClinic(clinic) {
    this.navigateTo(`/home/clinic/${clinic.clinicId}/edit`);
  }

  addDoctor(clinic) {
    this.navigateTo(`/home/clinic/add`);
  }

  updateStatus(clinicId, status) {
    this.clinicService.updateClinicStatus(clinicId, { status }).subscribe((resp: any) => {
      this.notificationService.showSuccess(resp.message);
      this.dt.clear();
    });
  }

  searchClinic($event: AutoCompleteCompleteEvent){
    const query = $event.query;
    if (query && query.length > 2) {
      this.clinicService.searchClinics(query).subscribe((resp: any) => {
        this.clinicSuggestions = resp.data;
      });
    }
  }

  loadClinics($event) {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;

    let params = new HttpParams();
    const filter = $event.filters;
    if (filter) {
      if (filter.clinic?.value) {
        params = params.append('clinicName', filter.clinic.value);
      }
      if (filter.organization?.value) {
        params = params.append('organizationId', filter.organization.value);
      }
      if (filter.organization?.value) {
        params = params.append('organization', filter.organization.value);
      }
      if (filter.speciality?.value) {
        filter.speciality.value.forEach((speciality) => {
          params = params.append('speciality', speciality);
        })
      }
      if (filter.state?.value) {
        params = params.append('state', filter.state.value);
      }
      if (!filter.status?.value) {
        filter.status = {
          value: 'All',
        };
      }
      if (filter.status?.value && filter.status?.value != 'All') {
        params = params.append('status', filter.status.value);
      }
    }
    ([{ field: 'clinicName', order: 1 }])?.forEach((sort) => {
      let field = sort.field;
      let order = sort.order;
      params = params.append('sort', (field + ' ' + (order == 1 ? 'asc' : 'desc')));
    });
    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows);
    
    this.clinicService.getAllClinics(params).subscribe({
      next: (resp: any) => {
        this.clinics = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
      }
    }
    );
  }
}
