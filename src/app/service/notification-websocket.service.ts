import { Injectable, PLATFORM_ID, inject, signal, OnDestroy } from '@angular/core';
import { Client, Frame } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { KeycloakService } from './keycloak.service';
import SockJS from 'sockjs-client';
import { NotificationService } from './notification.service';
import { environment } from '@environment/environment';
import { NotificationListService } from './notification-list.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationWebsocketService implements OnDestroy {

    private readonly platformId = inject(PLATFORM_ID);
    private readonly keycloakService = inject(KeycloakService);
    private readonly notificationService = inject(NotificationService);
    private readonly notificationListService = inject(NotificationListService);

    private stompClient: Client | undefined;
    private readonly connected$ = new BehaviorSubject<boolean>(false);
    private readonly isBrowser: boolean;
    private readonly baseUrl = environment.host;
    notificationRefresh = signal<boolean>(false);

    constructor() {
        this.notificationRefresh = this.notificationListService.notificationRefresh;
        this.isBrowser = isPlatformBrowser(this.platformId);
        if (this.isBrowser) {
            this.connect();
        }
    }
    public connect(): void {

        if (this.isConnected()) return;

        const token = this.keycloakService.getToken();
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(`${this.baseUrl}/notification-api/ws?token=${token}`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            debug: (str) => console.debug('STOMP:', str)
        });

        this.stompClient.onConnect = (frame: Frame) => {
            console.debug('Connected via STOMP:', frame);
            this.connected$.next(true);
            this.subscribeToNotifications();
        };

        this.stompClient.onStompError = (frame) => {
            console.error('STOMP error:', frame);
        };

        // this.stompClient.activate();
    }

    private subscribeToNotifications(): void {

        this.stompClient.subscribe('/user/queue/notifications', (message) => {
            const payload = JSON.parse(message.body);
            console.debug("Notification received: ", payload);
            this.notificationService.showInfo(payload.message, payload.title);
            this.notificationRefresh.set(true);
        });

        // User-specific notifications
        this.stompClient.subscribe(`/user/${this.keycloakService.userId}/queue/notifications`, (message) => {
            console.debug("Private: ", JSON.parse(message.body));
        });
    }

    isConnected(): boolean {
        return this.connected$.value;
    }

    ngOnDestroy(): void {
        if (this.stompClient?.active) {
            this.stompClient.deactivate().then(() => {
                this.connected$.next(false);
                console.debug('WebSocket disconnected on destroy');
            }).catch(err => {
                console.error('Error during WebSocket disconnect:', err);
            });
        } else {
            console.debug('WebSocket already disconnected on destroy');
        }
    }
}
