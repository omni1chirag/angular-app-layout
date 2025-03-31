import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { PracticeService } from '../service/practice.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { DividerModule } from 'primeng/divider';
import { TableAutoScrollDirective } from '../directive/table-auto-scroll.directive';

export interface Practice {
  id: number;
  name: string;
  type: string;
  organization: string;
  state: string;
  status: string;
  statusBoolean: boolean;
}

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-practice-list',
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
    TableAutoScrollDirective
  ],
  templateUrl: './practice-list.component.html',
  styleUrl: './practice-list.component.scss',
  providers: [MessageService]
})
export class PracticeListComponent {
  practices: Practice[] = [];
  isBrowser: boolean;
  private subscription!: Subscription;
  @ViewChild('filter') filter!: ElementRef;
  actions: boolean = true;
  cols!: Column[];
  statusList: any[] = [];
  exportColumns!: ExportColumn[];
  typeList!: any[] | [];
  selectedTypes: any = null;
  autoFilteredValue: any[] = [];
  filterFunction!: Function;

  optionsItems = [
    {
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-pen-to-square',
          routerLink: ['/home/practice/add-edit']
        },

      ]
    }
  ];

  constructor(
    private practiceService: PracticeService,
    @Inject(PLATFORM_ID) private platformId: object,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.subscription = this.practiceService.getPracticesMedium().subscribe(data => {
      this.practices = data;
    });

    this.practices.forEach(practice => {
      practice.statusBoolean = practice.status === 'active';
    });

    this.statusList = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
    ];

    this.practiceService.getPracticeTypes().then((practiceTypes) => {
      this.typeList = practiceTypes;
    });

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'organization', header: 'Organization' },
      { field: 'type', header: 'Type', customExportHeader: 'Practice Type' },
      { field: 'status', header: 'Status' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showToaster(detail: string, severity: string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  clear(table: Table) {
    table.clear();
    this.selectedTypes = null;
    if (this.filter && this.filter.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatus(practice: any): boolean {
    return practice.status === 'active';
  }

  setStatus(practice: any, value: boolean): void {
    practice.status = value ? 'active' : 'inactive';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  searchPracticeType(event: AutoCompleteCompleteEvent, filterCallback: Function) {
    this.filterFunction = filterCallback;
    const filtered: any[] = [];
    let query = event.query.toLowerCase();

    for (let i = 0; i < (this.typeList as any[]).length; i++) {
      const practiceType = (this.typeList as any[])[i];
      if (practiceType.value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(practiceType);
      }
    }
    // this.autoFilteredValue = this.typeList.filter(type =>
    //   type?.value?.toLowerCase().startsWith(query)
    // );
  }

  // searchPracticeType(event: any, filterCallback: Function) {
  //   if (event.query.length > 2) {
  //     console.log("Query ", event.query)
  //     let query = event.query.toLowerCase();

  //     this.autoFilteredValue = this.typeList
  //       .filter(type => type.label.toLowerCase().startsWith(query))
  //       .map(type => type.label);
  //     filterCallback(query);
  //   }
  // }

  onSelectType(event: any) {
    console.log(event.value.value)
    this.filterFunction(event.value.label)
    // filterCallback(event.value.label)
  }

  

}
