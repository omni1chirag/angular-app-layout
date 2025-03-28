import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { PageHeaderDirective } from '../../directive/page-header.directive';

@Component({
  selector: 'app-add-edit-commission',
  imports: [ToolbarModule, 
    DividerModule, 
    FormsModule, 
    InputTextModule, 
    DatePickerModule, 
    ButtonModule, 
    CommonModule, 
    SelectModule, 
    TextareaModule, 
    SelectButtonModule, 
    InputNumberModule,
    DividerModule,
    PageHeaderDirective],
  templateUrl: './add-edit-commission.component.html',
  styleUrl: './add-edit-commission.component.scss'
})
export class AddEditCommissionComponent {

  

  commissions: Array<commission> = []

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
    { name: 'Active', code: 'Active' },
    { name: 'Inactive', code: 'Inactive' }
  ];

  commissionType = [
    { name: '%', code: '%' },
    { name: 'Fixed Amount', code: 'Fixed Amount' }
  ];


  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private _router: Router) {
    isPlatformBrowser(platformId);
    this.addNewCommission();
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  save() {
    try{
      const currentListString: string = localStorage.getItem('commissions') || '[]';
      const list: any[] = JSON.parse(currentListString);
      list.push(this.commissions);
      localStorage.setItem('commissions', JSON.stringify(list))
      localStorage.removeItem('commission');
    }catch (error){
      console.log(error);
      
    }
    this.navigateTo('/home/setup/commission/list')
  }

  cancel() {
    this.navigateTo('/home/setup/commission/list')
  }

  addNewCommission(){
    let commissionId =  Date.now();
    const commission: commission =
    {
      commissionId:commissionId,
      serviceName: '',
      type: '%',
      value: 0,
      status: 'Active',
      effectiveDate: ''
    };
    this.commissions.push(commission);
  }

  deleteCommission(commissionId:number){
    this.commissions = this.commissions.filter(commission=> commission.commissionId != commissionId);
  }
}

interface commission {
  commissionId:number;
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