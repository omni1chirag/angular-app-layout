import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderDirective } from "@directive/page-header.directive";
import { TableAutoScrollDirective } from "@directive/table-auto-scroll.directive";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { KeycloakService } from "@service/keycloak.service";
import { NotificationListService } from "@service/notification-list.service";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { InputNumberModule } from "primeng/inputnumber";
import { MenuModule } from "primeng/menu";
import { SelectModule } from "primeng/select";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ToggleButtonModule } from "primeng/togglebutton";
import { ToolbarModule } from "primeng/toolbar";
import { HttpParams } from "@angular/common/http";
import { NotificationService } from "@service/notification.service";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { LabelIcon, NotificationResponse } from "@interface/notification.interface";
import { LabelValue } from "@interface/common.interface";
import { PlatformService } from "@service/platform.service";
import { UtilityService } from "@service/utility.service";
import { ApiResponse, PaginationResponse } from "@interface/api-response.interface";

@Component({
  selector: 'app-notification-list',
  imports: [
    CommonModule,
    ToolbarModule,
    TableModule,
    DividerModule,
    FormsModule,
    ButtonModule,
    MenuModule,
    TagModule,
    TranslateModule,
    SelectModule,
    PageHeaderDirective,
    TableAutoScrollDirective,
    AutoCompleteModule,
    InputNumberModule,
    ToggleButtonModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './notification-list.component.html'
})
export class NotificationListComponent implements OnInit {

  private readonly platformService = inject(PlatformService);
  private readonly notificationListService = inject(NotificationListService);
  private readonly keyCloakService = inject(KeycloakService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild('notificationTable') dt: Table;
  notifications: NotificationResponse[] = [];
  first = 0;
  totalRecords = 0;
  size = 50;
  showLoader = true;
  isBrowser = false;
  actions = false;
  messageSuggestions: LabelValue<string>[] = [];
  keyCloakUserId: string;
  optionsItems: LabelIcon[] = [{ label: 'MARK_AS_READ', icon: 'pi pi-check-circle' }, { label: 'DELETE', icon: 'pi pi-trash' }];
  notificationRefresh;
  selectedNotifications: NotificationResponse[] = [];

  constructor(
  ) {
    this.notificationRefresh = this.notificationListService.notificationRefresh;
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.keyCloakUserId = this.keyCloakService.userId;
  }

  loadNotifications($event: TableLazyLoadEvent): void {
    if (!this.isBrowser) {
      return;
    }
    this.showLoader = true;
    let params = new HttpParams();
    const sortField = $event.sortField;
    const sortOrder = $event.sortOrder;
    const filter = $event.filters as Record<string, { value: unknown }>;
    params = this.utilityService.setTableWhereClause(filter, params);

    if (sortField && sortOrder) {
      params = params.append('sort', (sortField + ' ' + (sortOrder == 1 ? 'asc' : 'desc')));
    }
    params = params.append('keyCloakUserId', this.keyCloakUserId);
    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows);
    this.notificationListService.getAllNotification<PaginationResponse<NotificationResponse>>(params).subscribe({
      next: (data) => {
        this.notifications = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: ({ error }: { error: ApiResponse<unknown> }) => {
        this.showLoader = false;
        this.notificationService.showError(error.message);
      }
    })
  }

  searchMessage($event: AutoCompleteCompleteEvent): void {
    const query = $event.query;
    if (query && query.length > 2 && this.keyCloakUserId) {
      this.notificationListService.searchMessages<LabelValue<string>[]>(query, this.keyCloakUserId).subscribe((data) => {
        this.messageSuggestions = data;
      });
    }
  }


  markAsRead(notificationId: string): void {
    this.notificationListService.markAsRead<ApiResponse<string>>(notificationId).subscribe((resp) => {
      this.notificationService.showSuccess(resp.message);
      this.dt.clear();
      this.notificationRefresh.set(true);
    })
  }

  markAllAsRead(): void {
    const ids = this.selectedNotifications.map(n => n.notificationId);
    this.notificationListService.markAllAsRead<ApiResponse<number>>(ids).subscribe((resp) => {
      this.notificationService.showSuccess(resp.message);
      this.dt.clear();
      this.notificationRefresh.set(true);
      this.selectedNotifications = [];
    })
  }

  delete(notificationId: string): void {
    this.notificationListService.deleteNotification<ApiResponse<string>>(notificationId).subscribe({
      next: (resp) => {
        this.notificationService.showSuccess(resp.message);
        this.dt.clear();
        this.notificationRefresh.set(true);
      },
      error: (error) => {
        console.error('Error deleting message:', error);
      }
    })
  }

  confirmDelete(notificationId?: string): void {
    const messageKey = notificationId
      ? 'NOTIFICATION.DELETE_CONFIRMATION'
      : 'NOTIFICATION.DELETE_ALL_CONFIRMATION';

    this.translate.get([messageKey, 'NOTIFICATION.CONFIRM_DELETE_HEADER']).subscribe(translations => {
      this.confirmationService.confirm({
        message: translations[messageKey],
        header: translations['NOTIFICATION.CONFIRM_DELETE_HEADER'],
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.translate.instant('NOTIFICATION.YES'),
        rejectLabel: this.translate.instant('NOTIFICATION.NO'),
        accept: () => {
          if (notificationId) {
            this.delete(notificationId);
          } else {
            this.deleteAll();
          }
        }
      });
    });
  }

  deleteAll(): void {
    const ids = this.selectedNotifications.map(n => n.notificationId);
    this.notificationListService.deleteAll<ApiResponse<number>>(ids).subscribe((resp) => {
      this.notificationService.showSuccess(resp.message);
      this.dt.clear();
      this.notificationRefresh.set(true);
      this.selectedNotifications = [];
    })
  }

  getOptionsItems(notification: NotificationResponse): LabelIcon[] {
    if (notification.read) {
      return this.optionsItems.filter(item => item.label !== 'MARK_AS_READ');
    }
    return this.optionsItems;
  }
}