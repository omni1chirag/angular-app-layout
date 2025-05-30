import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SubscriptionService } from '@service/subscription.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-subscription-plan',
  imports: [CommonModule,
            ToolbarModule,
            ButtonModule,
            ToastModule
           ],
  templateUrl: './subscription-plan.component.html',
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SubscriptionPlanComponent {
  plans = [
    { id: 'basic', name: 'Basic Plan', price: '500/month', features: ['Feature A', 'Feature B'] },
    { id: 'standard', name: 'Standard Plan', price: '1000/month', features: ['Feature A', 'Feature B', 'Feature C'] },
    { id: 'premium', name: 'Premium Plan', price: '1500/month', features: ['All Features'] }
  ];

  selectedPlanId: string | null = null;
  constructor(private subscriptionService: SubscriptionService,
    private messageService: MessageService,) { }

  selectPlan(planId: string) {
    this.selectedPlanId = planId;
  }
  save() {
    // this.subscriptionService.sendApprovalRequest(planId).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Request Sent',
        detail: 'Your subscription request has been sent for approval.'
      });
  }
}
