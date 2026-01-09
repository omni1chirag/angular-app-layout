export interface PaymentRecord {
    paymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    amount?: number;
    fee?: number;
    tax?: number;
    currency?: string;
    paymentMode?: string;
    recipientAccountId?: string;
    description?: string;
    transactionId?: string;
    appointmentId?: string;
    acquirerData?: Map<string, string>;
    razorpayStatus?: string;
    createdAt?:  string | number | null;
}