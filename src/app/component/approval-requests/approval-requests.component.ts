import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ApprovalRequestService } from '@service/approvalRequest.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { TableAutoScrollDirective } from '@directive/table-auto-scroll.directive';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { MasterService } from '@service/master.service';
import { HttpParams } from '@angular/common/http';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NotificationService } from '@service/notification.service';
import { table } from 'console';


export interface Doctor {
    doctorId: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
    registeredOn: Date;
    status: string;
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

interface LabelValue {
    label: string;
    value: any;
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
        TableAutoScrollDirective,
        AutoCompleteModule,
        MultiSelectModule,
        SelectButtonModule
    ],
    templateUrl: './approval-requests.component.html',
    styleUrl: './approval-requests.component.scss',
    providers: [MessageService]
})
export class ApprovalRequestsComponent {
    @ViewChild('approvereqTable') dt: Table;
    @ViewChild('filter') filter!: ElementRef;
    doctors!: Doctor[];
    initialValue: Doctor[] = [];
    selectedClient: Doctor[] = [];
    columnWidth = 150;
    cols: Column[] = [];
    exportColumns: ExportColumn[] = [];
    actions = false;
    isBrowser: boolean;
    showLoader = true;
    first = 0;
    totalRecords = 0;
    freezeDoctorName: boolean = false;
    doctorSuggestions: LabelValue[] = [];
    specialities: LabelValue[] = [];
    statuses: LabelValue[] = [];
    displayConfirmation = false;
    displayApproveConfirmation = false;
    displayRejectConfirmation = false;
    visibleDocument = false;
    visibleBottom = false;
    statusToUpdate: number = -1;
    rejectionReason = '';
    onResize() {
        const width = window.innerWidth;
        this.columnWidth = (width / 5) - 25;
    }

    constructor(
        private approvalRequestService: ApprovalRequestService,
        private masterService: MasterService,
        private notificationService: NotificationService,
        @Inject(PLATFORM_ID) private platformId: object,
        private messageService: MessageService
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        if (this.isBrowser) {
            this.onResize();
        }

        this.initializeMasterData();
    }

    initializeMasterData() {
        this.masterService.getSpeciality().subscribe((resp: any) => {
            this.specialities = resp.data;
        });

        this.masterService.getCommonMasterData(['STATUS']).subscribe((resp: any) => {
            (resp.data as any[]).forEach((res) => {
                if (res.name === 'STATUS') {
                    this.statuses = res.value;
                }
            });
        });
    }

    searchDoctors($event: AutoCompleteCompleteEvent) {
        const query = $event.query;
        if (query && query.length > 2) {
          this.approvalRequestService.searchDoctors(query).subscribe((resp: any) => {
            this.doctorSuggestions = resp.data;
          });
        }
    }

    showConfirmationDialog(client: Doctor, status: number) {
        this.selectedClient = [client];
        this.statusToUpdate = status;
        if (status === 1) {
            this.displayApproveConfirmation = true;
        } else {
            this.displayRejectConfirmation = true;
        }
    }

    updateStatus() {
        if (!this.selectedClient.length || !this.statusToUpdate) return;
    
        const doctorIds = this.selectedClient.map(client => client.doctorId);
        this.approvalRequestService.updateAllDoctorStatus(doctorIds, {status: this.statusToUpdate}).subscribe((resp: any) => {
            this.closeDialog();
            this.notificationService.showSuccess(resp.message);
            this.dt.clear();
          });
      }
    
    closeDialog() {
        this.displayApproveConfirmation = false;
        this.displayRejectConfirmation = false;
        this.selectedClient = [];
        this.statusToUpdate = -1;
        this.rejectionReason = '';
    }
    
    refreshTable() {
        this.loadDoctors({ first: this.first, rows: 10 });
    }
    
    showToaster(detail: string, severity: string = 'info') {
        this.messageService.add({ severity: severity, summary: 'Message', detail: detail, key: 'toasterKey', life: 3000 });
    }
    
    getActionItems(doctor: Doctor): MenuItem[] {
        return [
            {
                label: 'Approve',
                icon: 'pi pi-check',
                command: () => this.showConfirmationDialog(doctor, 1),
            },
            {
                label: 'Reject',
                icon: 'pi pi-times',
                command: () => this.showConfirmationDialog(doctor, -2),
            }
        ];
    }

    loadDoctors($event) {
        if (!this.isBrowser) {
            return;
        }
        this.showLoader = true;

        let params = new HttpParams();
        const filter = $event.filters;
        const sortField = $event.sortField;
        const sortOrder = $event.sortOrder;
        if (filter) {
            if (filter.doctor?.value) {
                params = params.append('doctor', filter.doctor?.value);
            }
            if (filter.email?.value) {
                params = params.append('email', filter.email.value);
            }
            if (filter.specialization?.value) {
                params = params.append('specialization', filter.specialization.value);
            }
            if (filter.registeredOn?.value) {
                params = params.append('registeredOn', filter.registeredOn.value);
            }
            params = params.append('status', 'Pending');
        }
        if (sortField && sortOrder) {
            params = params.append('sort', (sortField + ' ' + (sortOrder == 1 ? 'asc' : 'desc')));
        }
        params = params.append('page', Math.floor($event.first / $event.rows));
        params = params.append('size', $event.rows);

        this.approvalRequestService.getDoctors(params).subscribe({
            next: (resp: any) => {
                this.doctors = resp.data.content;
                this.totalRecords = resp.data.totalElements;
                this.showLoader = false;
            },
            error: (error) => {
                this.showLoader = false;
            }
        }
        );
    }

    onViewDocument() {
        this.visibleDocument = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onSelectionChange() {
        console.log('🔄 Selection Changed:', this.selectedClient);
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Rejected': return 'danger';
            case 'Approved': return 'success';
            case 'Pending': return 'warn';
            default: return 'secondary';
        }
    }

    exportCSV(table: Table) {
        table.exportCSV();
        this.showToaster("Downloading CSV file.");
    }

}
