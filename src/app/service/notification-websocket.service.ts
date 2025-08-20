import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Client, Message, Frame, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { KeycloakService } from './keycloak.service';
import SockJS from 'sockjs-client';
import { NotificationService } from './notification.service';
import { environment } from '@environment/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationWebsocketService {
    private stompClient?: Client | undefined;
    private connected$ = new BehaviorSubject<boolean>(false);
    isBrowser: boolean;
    private baseUrl = environment.host;

    constructor(@Inject(PLATFORM_ID) private platformId: object,
        private keycloakService: KeycloakService,
        private notificationService: NotificationService) {
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            // this.connect();
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
            debug: (str) => console.log('STOMP:', str)
        });

        this.stompClient.onConnect = (frame: Frame) => {
            console.info('Connected via STOMP:', frame);
            this.connected$.next(true);
            this.subscribeToNotifications();
        };

        this.stompClient.onStompError = (frame) => {
            console.error('STOMP error:', frame);
        };

        this.stompClient.activate();
    }

    private subscribeToNotifications(): void {

        this.stompClient.subscribe('/user/queue/notifications', (message) => {
            const payload = JSON.parse(message.body);
            console.log("Notification received: ", payload);
            this.notificationService.showInfo(payload.message, payload.title);
        });

        // User-specific notifications
        this.stompClient.subscribe(`/user/${this.keycloakService.userId}/queue/notifications`, (message) => {
            console.log("Private: ", JSON.parse(message.body));
        });
    }
    
    isConnected(): boolean {
        return this.connected$.value;
    }

    ngOnDestroy(): void {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.deactivate().then(() => {
                this.connected$.next(false);
                console.log('WebSocket disconnected on destroy');
            }).catch(err => {
                console.error('Error during WebSocket disconnect:', err);
            });
        }
    }
}
