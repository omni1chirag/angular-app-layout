import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-patient-list',
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
  templateUrl: './patient-list.component.html',
  providers:[MessageService],
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent {

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;
  isBrowser: boolean = false;
  patients: any[] = [];
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


  constructor(private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: object,
    private _http: HttpClient,
    private _router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngOnInit(): void {
    const currentListString: string = localStorage.getItem('patients') || '[]';
    this.patients = JSON.parse(currentListString);
    this._http.get('https://67e6aea16530dbd31111110a.mockapi.io/ehr/lite/patients').subscribe((data: any) => {
      this.patients.push(...data);
    });

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

  addEditMode(patient?: Notification) {
    if (patient && isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('patient', JSON.stringify(patient))
      } catch (error) {
        console.log(error);

      }
    }
    this.navigateTo('/home/patient/add-edit');

  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

}
