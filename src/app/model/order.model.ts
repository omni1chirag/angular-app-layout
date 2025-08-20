import { Customer } from "./customer.model";

export interface Note {
    key: string;
    value: string;
}

export class OrderModel {
    id?: string;
    amount: number;
    currency: string = 'INR';
    key: string;
    recipientId: string;
    createdAt?: Date;
    reciept: string;
    status: string;
    notes: Note[];  
    amountPaid?: number;
    amountDue?: number;
    attempts?: number;
    entity:string;
    offerId: string;
    customer: Customer;
}

