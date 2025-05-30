import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../service/notification.service';
import { ApiService } from '../service/api.service';
import { Observable, tap } from 'rxjs';
import { SubscriptionPlan } from '../model/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private notificationService = inject(NotificationService);
  private apiService = inject (ApiService)
  private apiUrls = {
    subscription: 'ebplp-api/subscriptions/approval-request',
    subscriptionPlan: 'ebplp-api/subscriptions'
  }
  constructor() { }

  get endpoints() {
    const base = 'ebplp-api/subscriptions';
    return {
      base,
      byId: (id: string) => `${base}/${id}`,
      list: `${base}/list`
    };
  }

  getDefaultSubscriptions(): Observable<SubscriptionPlan[]> {
    return this.apiService.get<SubscriptionPlan[]>(this.endpoints.base).pipe(
      // tap(() => this.notificationService.showSuccess('Subscription fetched successfully'))
    );
  }

  sendApprovalRequest(planId: string) {
    return this.apiService.post(this.apiUrls.subscription, { planId });
  }
}
