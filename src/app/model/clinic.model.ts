import { Organization } from "./organization.model";

export class Clinic{
    organization: Organization;
    organizationId: string;
    clinicId: string;
    clinicName: string;
    clinicRegistrationId: string;
    gstin: string;
    yearOfEstablishment: number;
    status: number;
    clinicLogo: string;
    speciality: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    mobileNumber: string;
    email: string;
    website: string;
    businessLicense: string;
    acceptedPaymentModes: string[];
    practiceSubscription: PracticeSubscription;
}
export class PracticeSubscription {
    practiceSubscriptionId: string;
    clinic?: Clinic;
    startDate: Date;
    expiryDate: Date;
    paymentMethod: string;
    subscriptionStatus: string;
}

export class PaymentMode {
    paymentModeId: string;
    name: string;
    status: boolean;
    description: string;
}