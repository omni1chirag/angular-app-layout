import { TransferModel } from "./transfer.model";

export interface Note {
    key: string;
    value: string;
}

export class OrderModel {
    razorpayId?: string;
    entity?: string;
    amount?: number;
    amountPaid?: number;
    amountDue?: number;
    currency = 'INR';
    receipt: string;
    status: string;
    attempts?: number;
    notes: Note[];  
    createdAt?: Date;
    key: string;
    offerId: string;
    accountId: string;
    config:Config
    transfers?:TransferModel[];
}

