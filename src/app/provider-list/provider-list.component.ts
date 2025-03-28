import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
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
import { ProviderService } from '../service/provider.service';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { DividerModule } from 'primeng/divider';
import { TableAutoScrollDirective } from '../directive/table-auto-scroll.directive';

export interface Provider {
  providerName: string;
  Specialization: string;
  practiceName: string;
  organizationName: string;
  ConsultationMode: string;
  Status: string;
}

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [ButtonModule,
            ToolbarModule,
            TableModule,
            CommonModule,
            TagModule,
            SelectModule,            
            FormsModule,
            ToggleButtonModule,
            MenuModule,
            PageHeaderDirective,
            DividerModule,
            TableAutoScrollDirective
        ],
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService]
})
export class ProviderListComponent {
  providers!: Provider[];
  @ViewChild('filter') filter!: ElementRef;
  selectedprovider: Provider[] = []; 
  actions: boolean = false; 
  isBrowser: boolean;
  statusList: any[] = [];
  // private subscription!: Subscription;
  optionsItems = [
    {
      label: 'Actions',
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-pen-to-square',
          // command: () => this.openApprovalConfirmation()
        },
      ]
    }
  ];

  constructor(private router: Router,
    private messageService: MessageService,
    private providerService: ProviderService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.providerService.getClientMedium().then(data => {
      this.providers = data;
    });
    this.providerService.getClientMedium().then(
      (providers) => (this.providers = providers)
    ).catch(
      (err) => console.error('Error fetching providers:', err)
    );

    this.statusList = [
      { label: 'Active', value: 'Active' },
      { label: 'InActive', value: 'InActive' },
  ];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
  
  showToaster(detail:string, severity:string = 'info') {
    this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
  }

  exportCSV(table: Table) {
    table.exportCSV();
    this.showToaster("downloading CSV file.")
  }

  onSelectionChange() {
    console.log('🔄 Selection Changed:',  this.selectedprovider);
  }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

  getSeverity(Status: string) {
    switch (Status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  }

}
