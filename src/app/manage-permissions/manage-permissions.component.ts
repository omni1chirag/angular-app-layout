import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { AccordionModule } from 'primeng/accordion';
import { PickListModule } from 'primeng/picklist';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { PageHeaderDirective } from '../directive/page-header.directive';

interface Role {
  value:number;
  label:string;
}
@Component({
  selector: 'app-manage-permissions',
  imports: [ToolbarModule, 
    ButtonModule, 
    DividerModule, 
    AccordionModule, 
    PickListModule, 
    SelectModule, 
    FormsModule,
    PageHeaderDirective,
    ],
  templateUrl: './manage-permissions.component.html',
  styleUrl: './manage-permissions.component.scss'
})
export class ManagePermissionsComponent {
  sourcePermissions: any[] = [];
  targetPermissions: any[] = [];
  selectedRole: Role | undefined;
  roles:Role[] = [];
  

  ngOnInit() {

    this.roles = [
      { "value": 1, "label": "Security Admin" },
      { "value": 2, "label": "Administrator" },
      { "value": 3, "label": "Front Desk" },
      { "value": 4, "label": "Front Desk Manager" },
      { "value": 5, "label": "Nurse" },
      { "value": 6, "label": "Nurse Practitioner" },
      { "value": 7, "label": "Medical Assistant" },
      { "value": 8, "label": "Billing Supervisor" },
      { "value": 9, "label": "Biller" },
      { "value": 10, "label": "Office Manager" },
      { "value": 11, "label": "Collections & AR" },
      { "value": 12, "label": "OmniMD Administrator" },
      { "value": 13, "label": "OmniMD User" },
      { "value": 14, "label": "Referral Provider" },
      { "value": 15, "label": "Transcriptionist" },
      { "value": 16, "label": "Vendor" },
      { "value": 17, "label": "Patient" },
      { "value": 18, "label": "Careworker" }
    ]
    this.sourcePermissions = [
      { name: 'San Francisco ', code: 'SF' },
      { name: 'London', code: 'LDN' },
      { name: 'Paris', code: 'PRS' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Berlin', code: 'BRL' },
      { name: 'Barcelona', code: 'BRC' },
      { name: 'Rome', code: 'RM' }
    ];

    this.targetPermissions = [];


  }

  onOpenAccordian(roleName: string) {
    console.log(roleName);
  }
}
