export class TransferModel {
    transferId?: string;
    entity?: string;
    transferStatus?: string; //created, pending, processed, failed, reversed, partially_reversed
    settlementStatus?: string; //pending, on_hold, settled
    source?: string;// razorpay paymentId
    recipient?: string; // razorpay linked accountId on which transfer is made
    amount?: number;
    account?: string;
    currency?: string
    amountReversed?; number;
    notes?: Map<string, string>;
    error?: ErrorModel;
    fee?: number;
    tax?: number
    onHold?: boolean;
    onHoldUntil?: number;
    recipientSettlementId?: string;
    createdAt?: string;
    linkedAccountNotes?: string[];
    processedAt?: string;
}

export class ErrorModel {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: Map<string, string>;
}