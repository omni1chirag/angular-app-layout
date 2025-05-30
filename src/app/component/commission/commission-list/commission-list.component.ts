import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';

@Component({
  selector: 'app-commission-list',
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
    TableAutoScrollDirective],
  providers: [MessageService],
  templateUrl: './commission-list.component.html',
  styleUrl: './commission-list.component.scss'
})
export class CommissionListComponent implements OnInit {
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  actions: boolean = false;
  isBrowser: boolean = false;
  commissions: Array<Commission> = [];
  optionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-check-circle'
        },
        {
          label: 'History',
          icon: 'pi pi-history'
        }
      ]
    }
  ];
  serviceName = [
    { name: "Complete Blood Count", code: "CBC" },
    { name: "Lipid Profile", code: "LIPID" },
    { name: "Liver Function Test", code: "LFT" },
    { name: "Renal Panel", code: "RENAL" },
    { name: "Thyroid Stimulating Hormone", code: "TSH" },
    { name: "Hemoglobin A1c", code: "A1C" },
    { name: "Electrolyte Panel", code: "ELEC" },
    { name: "Urinalysis", code: "URINALYSIS" },
    { name: "Coagulation Profile", code: "COAG" },
    { name: "Vitamin D Test", code: "VITD" },

    { name: "Amoxicillin", code: "AMOX" },
    { name: "Ibuprofen", code: "IBU" },
    { name: "Paracetamol", code: "PARA" },
    { name: "Metformin", code: "MET" },
    { name: "Atorvastatin", code: "ATOR" },
    { name: "Omeprazole", code: "OMEP" },
    { name: "Lisinopril", code: "LISI" },
    { name: "Simvastatin", code: "SIM" },
    { name: "Amlodipine", code: "AML" },
    { name: "Metoprolol", code: "METO" }
  ];

  stateOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];
  constructor(private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: object,
    private _router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

  }
  ngOnInit(): void {
    if (this.isBrowser) {
      const currentListString: string = localStorage.getItem('commissions') || '[]';
      this.commissions = JSON.parse(currentListString);
      this.commissions = [...this.commissions, ...externalCommissions]
    }
  }

  clear(table: Table) {
    table.clear();
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }
  showToaster(detail: string, severity: string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  addEditMode(commission?: Commission) {
    if (this.isBrowser) {
      if (commission) {
        localStorage.setItem('commission', JSON.stringify(commission))
      } else {
        localStorage.removeItem('commission');
      }
    }
    this.navigateTo('/home/setup/commission/add-edit')

  }
}

interface Commission {
  commissionId: number;
  serviceName: string;
  type?: string;
  value: number;
  status: string;
  effectiveDate: string;
  modifiedBy?: string;
  modifiedOn?: string;
  createdOn?: string;
  createdBy?: string;
};
export const externalCommissions: Array<Commission> =
  [
    {
      "commissionId": 1742554888012,
      "serviceName": "Complete Blood Count",
      "type": "%",
      "value": 5,
      "status": "Active",
      "effectiveDate": "2025-02-28T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888013,
      "serviceName": "Amoxicillin",
      "type": "%",
      "value": 10,
      "status": "Inactive",
      "effectiveDate": "2025-03-01T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888014,
      "serviceName": "Lipid Profile",
      "type": "%",
      "value": 15,
      "status": "Active",
      "effectiveDate": "2025-03-02T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888015,
      "serviceName": "Ibuprofen",
      "type": "%",
      "value": 20,
      "status": "Inactive",
      "effectiveDate": "2025-03-03T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888016,
      "serviceName": "Liver Function Test",
      "type": "%",
      "value": 25,
      "status": "Active",
      "effectiveDate": "2025-03-04T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888017,
      "serviceName": "Paracetamol",
      "type": "%",
      "value": 30,
      "status": "Inactive",
      "effectiveDate": "2025-03-05T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888018,
      "serviceName": "Renal Panel",
      "type": "%",
      "value": 35,
      "status": "Active",
      "effectiveDate": "2025-03-06T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888019,
      "serviceName": "Metformin",
      "type": "%",
      "value": 40,
      "status": "Inactive",
      "effectiveDate": "2025-03-07T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888020,
      "serviceName": "Thyroid Stimulating Hormone",
      "type": "%",
      "value": 45,
      "status": "Active",
      "effectiveDate": "2025-03-08T18:30:00.000Z"
    },
    {
      "commissionId": 1742554888021,
      "serviceName": "Atorvastatin",
      "type": "%",
      "value": 50,
      "status": "Inactive",
      "effectiveDate": "2025-03-09T18:30:00.000Z"
    }
  ]
