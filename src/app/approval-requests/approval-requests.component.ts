import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ClientService } from '../service/client.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { PageHeaderDirective } from '../directive/page-header.directive';
import { TableAutoScrollDirective } from '../directive/table-auto-scroll.directive';


export interface Client {
    id: string;
    name: string;
    type: string;
    specialty?: string;
    contactNumber: string;
    email: string;
    address: string;
    registeredOn: Date;
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
    selector: 'app-approval-requests',
    standalone: true,
    imports: [
        TableModule,
        CommonModule,
        ToggleButtonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        DrawerModule,
        CardModule,
        TagModule,
        ToastModule,
        MenubarModule,
        InputTextModule,
        DividerModule,
        TextareaModule,
        IconFieldModule,
        InputIconModule,
        SelectModule,
        ToolbarModule,
        MenuModule,
        PageHeaderDirective,
        TableAutoScrollDirective
        ],
    templateUrl: './approval-requests.component.html',
    styleUrl: './approval-requests.component.scss',
    providers: [MessageService]
})
export class ApprovalRequestsComponent {
    clients!: Client[];
    actions: boolean = false;
    isBrowser: boolean;
    displayApproveConfirmation: boolean = false;
    displayRejectConfirmation: boolean = false;
    visibleBottom: boolean = false;
    visibleDocument: boolean = false;
    // items: MenuItem[] | undefined;
    rejectionReason: string = '';
    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('dt1') dt1!: Table;

    statusList: any[] = [];
    selectedClients: Client[] = [];
    cols!: Column[];
    exportColumns!: ExportColumn[];
    // isSorted: boolean | null = null;
    initialValue!: Client[];

    optionsItems = [
        {
            items: [
                {
                    label: 'Approve',
                    icon: 'pi pi-check-circle',
                    command: () => this.openApprovalConfirmation()
                },
                {
                    label: 'Reject',
                    icon: 'pi pi-times-circle',
                    command: () => this.openRejectConfirmation()
                },
                {
                    label: 'View Details',
                    icon: 'pi pi-eye',
                    command: () => this.visibleBottom =true
                }

            ]
        }
    ];


    constructor(private clientService: ClientService,
        @Inject(PLATFORM_ID) private platformId: object,
        private messageService: MessageService) {
        this.isBrowser = isPlatformBrowser(platformId);
    }
    ngOnInit() {
        this.clientService.getClientMedium().then((data) => {
            this.clients = data;
            this.initialValue = [...data]
        });

        this.statusList = [
            { label: 'Approved', value: 'approved' },
            { label: 'Pending', value: 'pending' },
            { label: 'Rejected', value: 'rejected' },
        ];

        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'type', header: 'Type' },
            { field: 'specialty', header: 'Specialty', customExportHeader: 'Provider Specialty' },
            { field: 'status', header: 'Status' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    }

    openApprovalConfirmation() {
        this.displayApproveConfirmation = true;

    }
    openRejectConfirmation() {
        this.displayRejectConfirmation = true;
    }

    closeApprovalConfirmation() {
        this.displayApproveConfirmation = false;
        this.showToaster("Provider has been approved. An email notification has been sent.");

    }

    closeRejectConfirmation() {
        this.displayRejectConfirmation = false;
        this.showToaster("Provider has been rejected. An email notification has been sent with the reason.");
        this.rejectionReason = '';
    }

    onViewDocument() {
        this.visibleDocument = true;
    }


    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    showToaster(detail: string, severity: string = 'info') {
        this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
    }

    onSelectionChange() {
        console.log('🔄 Selection Changed:', this.selectedClients);
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Rejected':
                return 'danger';

            case 'Approved':
                return 'success';

            case 'Pending':
                return 'warn';

            case 'New':
                return 'info';
            default:
                return 'secondary';
        }
    }

    exportCSV(table: Table) {
        table.exportCSV();
        this.showToaster("downloading CSV file.")
    }

}
