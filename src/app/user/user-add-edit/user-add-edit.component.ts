import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PasswordModule } from 'primeng/password';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuItem } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PageHeaderDirective } from '../../directive/page-header.directive';
import { Router } from '@angular/router';

interface Country {
  name: string;
  code: string;
}

@Component({
  selector: 'app-user-add-edit',
  imports: [AutoCompleteModule, 
    FormsModule, 
    InputTextModule, 
    DatePickerModule, 
    AvatarModule, 
    ButtonModule, 
    FileUploadModule, 
    CommonModule, 
    SelectModule, 
    CheckboxModule, 
    RadioButtonModule, 
    DividerModule, 
    InputNumberModule, 
    SelectButtonModule, 
    PasswordModule, 
    ToolbarModule, 
    IconFieldModule, 
    InputIconModule, 
    SplitButtonModule,
    PageHeaderDirective,
    DividerModule],
  templateUrl: './user-add-edit.component.html',
  styleUrl: './user-add-edit.component.scss'
})
export class UserAddEditComponent {
  selectedTypes: any = null;
  autoFilteredValue: any[] = [];
  uploadedFiles: any[] = [];
  countries: Country[] | undefined;
  selectedCountry: Country | undefined;
  genderValue!: number;
  statusValue!: number;
  selectedAutoValue: any = null;
  filteredPracticeValue: any[] = [];
  practiceValue: any[] | undefined;

  statusOptions: any[] = [
    { name: 'Active', value: 1 },
    { name: 'Inactive', value: 2 },
  ];

  genderOptions: any[] = [
    { name: 'Male', value: 1 },
    { name: 'Female', value: 2 },
    { name: 'Unknown', value: 3 },
    { name: 'Prefer not to say', value: 4 },
    { name: 'Other', value: 5 },

  ];

  items: MenuItem[] = [
    {
      label: 'Save',
      icon: 'pi pi-check'
    },
    {
      label: 'Update',
      icon: 'pi pi-upload'
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash'
    },
    {
      label: 'Home Page',
      icon: 'pi pi-home'
    }
  ];

  constructor(private router: Router) { } 
ngOnInit() {
  this.countries = [
    { name: 'India', code: 'IN' },
    { name: 'United States', code: 'USA' },
    { name: 'United Kingdom', code: 'UK' },
  ];

  this.practiceValue = [
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Albania', code: 'AL' },
    { name: 'Algeria', code: 'DZ' },
    { name: 'American Samoa', code: 'AS' },
    { name: 'Andorra', code: 'AD' },
    { name: 'Angola', code: 'AO' },
  ]
}

onUpload(event: any) {
  for (const file of event.files) {
    this.uploadedFiles.push(file);
  }
}

filterPractice(event: AutoCompleteCompleteEvent) {
  const filtered: any[] = [];
  const query = event.query;

  for (let i = 0; i < (this.practiceValue as any[]).length; i++) {
    const country = (this.practiceValue as any[])[i];
    if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
      filtered.push(country);
    }
  }

  this.autoFilteredValue = filtered;
}

onBasicUploadAuto(event: UploadEvent) {
  // this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Auto Mode' });
}

navigateToListPage(){
  this.router.navigateByUrl('/home/user/list');
}
}
