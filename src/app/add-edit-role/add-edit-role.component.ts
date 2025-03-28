import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../directive/page-header.directive';

@Component({
  selector: 'app-add-edit-role',
  imports: [ButtonModule,
    InputTextModule,
    SelectButton,
    FormsModule,
    ToolbarModule,
    DividerModule,
    PageHeaderDirective
  ],
  templateUrl: './add-edit-role.component.html',
  styleUrl: './add-edit-role.component.scss'
})
export class AddEditRoleComponent {
  constructor(private router: Router) { }  
  genderOptions: any[] = [
    { name: 'Active', value: 1 },
    { name: 'InActive', value: 2 },
  ];
  genderValue!: number;

  navigateToListPage(){
    this.router.navigateByUrl('/home/role/list');
  }
}
