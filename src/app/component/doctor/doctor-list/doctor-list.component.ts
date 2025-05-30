import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { DoctorService } from '@service/doctor.service';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { DividerModule } from 'primeng/divider';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { NotificationService } from '@service/notification.service';
import { HttpParams } from '@angular/common/http';
import { MasterService } from '@service/master.service';

export interface Doctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  clinics: string;
  organization: string;
  consultationMode: string;
  status: string;
}

interface LabelValue {
  label: string;
  value: any;
}
@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [ButtonModule,
    ToolbarModule,
    TableModule,
    CommonModule,
    TagModule,
    PaginatorModule,
    SelectModule,
    FormsModule,
    ToggleButtonModule,
    MenuModule,
    PageHeaderDirective,
    DividerModule,
    TableAutoScrollDirective,
    MultiSelectModule,
    AutoCompleteModule,
    SelectButtonModule,
    TooltipModule,
    FormsModule,
  ],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService]
})
export class DoctorListComponent {
  doctors!: Doctor[];
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('doctorTable') dt: Table;
  clinics: LabelValue[] = [];
  organizations: LabelValue[] = [];
  statusList: LabelValue[] = [];
  doctorSuggestions: LabelValue[] = [];
  specialities: LabelValue[] = [];
  consultationModeOptions: LabelValue[] = [];
  freezeDoctorName: boolean = false;
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 150;
  showLoader = true;
  actions: boolean = true;
  isBrowser: boolean;


  selectedDoctor: Doctor[] = [];
  optionsItems = [{ label: 'Edit', icon: 'pi pi-pen-to-square' }, { label: 'status', icon: 'pi pi-times-circle' }];


  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }

  constructor(private router: Router,
    private messageService: MessageService,
    private doctorService: DoctorService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: object,
    private massterService: MasterService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.onResize();
    }
    this.initializeMasterData();
  }

  initializeMasterData() {
    this.doctorService.getOrganizationLabels().subscribe((resp: any) => {
      this.organizations = resp.data;
    });

    this.massterService.getSpeciality().subscribe((resp: any) => {
      this.specialities = resp.data;
    })

    const params = ['STATUS', 'CONSULTATION_MODE']
    this.massterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'STATUS':
            this.statusList = res.value
            break;
          case 'CONSULTATION_MODE':
            this.consultationModeOptions = res.value
            break;
          default:
            console.log('name not found', res.name);
            break;
        }
      })
    });
  }

  searchDoctors($event: AutoCompleteCompleteEvent) {
    const query = $event.query;
    if (query && query.length > 2) {
      this.doctorService.searchDoctors(query).subscribe((resp: any) => {
        this.doctorSuggestions = resp.data;
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
    this.doctorService.getClinicLabels(organizationId).subscribe((resp: any) => {
      this.clinics = resp.data;
    })
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  editDoctor(doctor) {
    this.navigateTo(`/home/doctor/${doctor.doctorId}/edit`);
  }

  updateStatus(doctorId, status) {
    this.doctorService.updateDoctorStatus(doctorId, { status }).subscribe((resp: any) => {
      this.notificationService.showSuccess(resp.message);
      this.dt.clear()
    });
  }

  loadDoctors($event) {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;

    let params = new HttpParams();
    const filter = $event.filters;
    const sortField = $event.sortField;
    const sortOrder = $event.sortOrder;

    if (filter) {
      if (filter.doctor?.value) {
        params = params.append('doctor', filter.doctor?.value);
      }
      if (filter.specialization?.value) {
        params = params.append('specialization', filter.specialization.value);
      }
      if (filter.organization?.value) {
        params = params.append('organization', filter.organization.value);
      }
      if (filter.clinic?.value) {
        filter.clinic?.value.forEach((clinic) => {
          params = params.append('clinic', clinic);
        })
      }
      if (filter.consultationMode?.value) {
        filter.consultationMode?.value.forEach((mode) => {
          params = params.append('consultationMode', mode);
        })
      }
      if (!filter.status?.value) {
        filter.status = {
          value: 'Active',
          matchMode: "equals"
        };
      }
      params = params.append('status', filter.status.value);
    }



    if (sortField && sortOrder) {
      params = params.append('sort', (sortField + ' ' + (sortOrder == 1 ? 'asc' : 'desc')));
    }
    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows);

    this.doctorService.getDoctors(params).subscribe({
      next: (resp: any) => {
        this.doctors = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
      }
    }
    );
  }







  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  showToaster(detail: string, severity: string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }

  onSelectionChange() {
    console.log('🔄 Selection Changed:', this.selectedDoctor);
  }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

  getSeverity(status: string) {
    switch (status) {
      case '1':
        return 'success';
      case '0':
        return 'danger';
      default:
        return 'secondary';
    }
  }

}
