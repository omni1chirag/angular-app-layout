export class SubscriptionPlan {
    subscriptionPlanId: string;
    planName: string;
    billingCycle: string;
    status:boolean;
    type: string;
    includedFeatures: String[];
    acceptedPaymentModes: String[];
}