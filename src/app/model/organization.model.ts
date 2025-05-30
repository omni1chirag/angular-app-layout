import { SubscriptionPlan } from "./subscription.model";

export class Organization {
    organizationId: string;
    organizationName: string;
    organizationStatus: string;
    legalOrganizationName: string;
    gstin: string;
    yearOfEstablishment: Date;
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    mobileNumber: string;
    email: string;
    website: string;
    logo: string;
    businessLicense: string;
    acceptedPaymentModes: String[];
    organizationSubscription: OrganizationSubscription;
    organizationSubscriptionId: string;
    subscriptionPlanId: string;
    subscriptionPlanName: string;

}

export class OrganizationSubscription {
    organizationSubscriptionId: string;
    organization?: Organization;
    subscriptionPlanId: string;
    startDate: Date;
    expiryDate: Date;
    paymentMethod: string;
    subscriptionStatus: string;

}

export class Feature {
    featureId: string;
    featureName: string;
    description: string;
    status: boolean;
}

export class PaymentMode {
    paymentModeId: string;
    name: string;
    status: boolean;
    description: string;
}