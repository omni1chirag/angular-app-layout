import { Injectable, signal, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { HttpParams } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class NotificationListService {

    notificationRefresh = signal<boolean>(false);
    
    private readonly apiUrls = {
        notifications: 'notification-api/notifications'
    }    

    private readonly apiService = inject(ApiService);

    getNotifications<T>(keyCloakUserId: string): Observable<T> {
        return this.apiService.post(`${this.apiUrls.notifications}/get-unread-notifications`, keyCloakUserId)
    }

    getNotificationCounts<T>(keyCloakUserId: string): Observable<T> {
        return this.apiService.post(`${this.apiUrls.notifications}/get-notification-counts`, keyCloakUserId)
    }

    searchMessages<T>(searchParams: string, keyCloakUserId: string): Observable<T> {
        const params = new HttpParams().append('message', searchParams).append('keyCloakUserId', keyCloakUserId);
        return this.apiService.get(`${this.apiUrls.notifications}/search`, { params });
    }

    getAllNotification<T>(params?: HttpParams): Observable<T> {
        return this.apiService.get(`${this.apiUrls.notifications}/get-all-notifications`, { params });
    }

    markAsRead<T>(notificationId: string): Observable<T> {
        return this.apiService.patch(`${this.apiUrls.notifications}/mark-as-read/${notificationId}`, null, { needFullResponse: true });
    }

    markAllAsRead<T>(notificationIds: string[]): Observable<T> {
        return this.apiService.put(`${this.apiUrls.notifications}/mark-all-as-read`, notificationIds, { needFullResponse: true });
    }

    deleteNotification<T>(notificationId: string): Observable<T> {
        return this.apiService.delete(`${this.apiUrls.notifications}/delete/${notificationId}`, { needFullResponse: true })
    }

    deleteAll<T>(notificationIds: string[]): Observable<T> {
        return this.apiService.put(`${this.apiUrls.notifications}/delete-all`, notificationIds, { needFullResponse: true });
    } 

}