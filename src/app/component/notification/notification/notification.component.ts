import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TooltipModule } from "primeng/tooltip";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { Popover } from "primeng/popover";
import { BadgeModule } from "primeng/badge";
import { ChipModule } from "primeng/chip";
import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { NotificationListService } from "@service/notification-list.service";
import { KeycloakService } from "@service/keycloak.service";
import { Router } from '@angular/router';
import { NotificationService } from "@service/notification.service";
import { NotificationResponse } from "@interface/notification.interface";
import { ApiResponse } from "@interface/api-response.interface";

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [
        CommonModule,
        ConfirmDialogModule,
        BadgeModule,
        OverlayPanelModule,
        Popover,
        TooltipModule,
        ChipModule,
        TranslateModule
    ],
    templateUrl: './notification.component.html'
})
export class NotificationComponent implements OnInit {
    private readonly notificationListService = inject(NotificationListService);
    private readonly keyCloakService = inject(KeycloakService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);

    @ViewChild('notificationPanel') notificationPanel!: Popover;
    notifications: NotificationResponse[] = [];
    keyCloakUserId: string;
    notificationRefresh;

    constructor() {
        this.notificationRefresh = this.notificationListService.notificationRefresh;
    }

    ngOnInit(): void {
        this.keyCloakUserId = this.keyCloakService.userId;
    }

    toggleNotifications(event: Event): void {
        this.getNotifications();
        this.notificationPanel.toggle(event);
    }

    getNotifications(): void {
        if (!this.keyCloakUserId) return;
        this.notificationListService.getNotifications<NotificationResponse[]>(this.keyCloakUserId).subscribe({
            next: (data) => {
                this.notifications = data;
            }
        })
    }

    viewAll(): void {
        this.notificationPanel.hide();
        this.router.navigateByUrl('/home/notification/list');
    }

    markAsRead(notificationId: string): void {
        this.notificationListService.markAsRead<ApiResponse<string>>(notificationId).subscribe((resp) => {
            this.notificationService.showSuccess(resp.message);
            this.getNotifications();
            this.notificationRefresh.set(true);
        })
    }
}