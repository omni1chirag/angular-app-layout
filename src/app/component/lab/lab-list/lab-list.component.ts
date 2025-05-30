import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, input, model, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '@service/master.service';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { LabAddEditComponent } from "../lab-add-edit/lab-add-edit.component";
import { HttpParams } from '@angular/common/http';
import { PatientLabService } from '@service/patient-lab.service';
import { NotificationService } from '@service/notification.service';
import { MenuModule } from 'primeng/menu';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { PaginatorModule } from 'primeng/paginator';

interface LabelValue {
  label: string;
  value: any;
}

@Component({
  selector: 'app-lab-list',
  imports: [ToolbarModule,
    ButtonModule,
    TableModule,
    CommonModule,
    SelectModule,
    FormsModule, 
    LabAddEditComponent,
    MenuModule,
    TableAutoScrollDirective,
    PaginatorModule],
  templateUrl: './lab-list.component.html',
})
export class LabListComponent {
  @ViewChild('labTable') dt: Table;
  appointmentId = input.required<string>();
  patientId = input.required<string>();
  lab!: any[];
  first = 0;
  totalRecords = 0;
  size = 50;
  columnWidth = 100;
  actions: boolean = true;
  isBrowser: boolean;
  showLoader = true;
  testName: LabelValue[] = [];
  testTypes: LabelValue[] = [];
  statuses: LabelValue[] = [];
  visible: boolean = false;
  selectedLab: any = null;
  // patientId: string;
  optionsItems = [
    {
      label: 'Edit',
      icon: 'pi pi-pen-to-square',
    }
  ];

  onResize() {
    const width = window.innerWidth;
    this.columnWidth = (width / 5) - 25;
  }
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private masterService: MasterService,
    private patientLabService: PatientLabService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const { params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    if (!this.patientId) {
      const { params } = this.activatedRoute.parent?.snapshot;
      this.patientId = params['id'];
    }
    this.initializeMasterData();
    if (this.isBrowser) {
      this.onResize();
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  addLab(){
    this.visible = true;
    this.selectedLab = null;
  }
  editLab(lab: any): void {
    this.selectedLab = lab;
    this.visible = true;
  }

  loadLabs($event) {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;
    let params = new HttpParams();
    const filter = $event.filters;
    if (filter) {
      if (this.patientId) {
        params = params.append('patientId', this.patientId());
      }
      if (filter.labId?.value) {
        params = params.append('labId', filter.labId.value);
      }
      if (filter.testName?.value) {
        params = params.append('testName', filter.testName.value);
      }
      if (filter.testTypes?.value) {
        params = params.append('testType', filter.testTypes.value);
      }      
      if (filter.orderDate?.value) {
        const date = new Date(filter.orderDate.value);
        const fixedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const formattedDate = fixedDate.toISOString().split('T')[0]; // Gives "2025-05-25"
        params = params.append('orderDate', formattedDate);
      }            
      if (filter.testDate?.value) {
        const date = new Date(filter.testDate.value);
        const fixedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const formattedDate = fixedDate.toISOString().split('T')[0]; // Gives "2025-05-25"
        params = params.append('testDate', formattedDate);
      }      
      if (filter.sampleCollectionLocation?.value) {
        params = params.append('sampleCollectionLocation', filter.sampleCollectionLocation.value);
      }
      if (filter.status?.value) {
        params = params.append('status', filter.status.value);
      }
    }
    const sortField = $event.sortField || 'labId';
    const sortOrder = $event.sortOrder === 1 ? 'asc' : 'desc';
    params = params.append('sort', `${sortField} ${sortOrder}`);

    params = params.append('size', this.size);
    params = params.append('page', Math.floor($event.first / this.size));
    this.patientLabService.getAllLabs(this.patientId, params).subscribe({
      next: (resp: any) => {
        this.lab = resp.data.content;
        this.totalRecords = resp.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        this.showLoader = false;
      }
    }
    );
  }

  initializeMasterData(){
    this.masterService.getTestName().subscribe({
      next: (resp: any) => {
        this.testName = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Test Names :', error);
      }
    });
    this.masterService.getTestType().subscribe({
      next: (resp: any) => {
        this.testTypes = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Test Types :', error);
      }
    });
    this.masterService.getPatientLabStatus().subscribe({
      next: (resp: any) => {
        this.statuses = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Lab Statuses :', error);
      }
    });
  }
}
