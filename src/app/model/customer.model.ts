import { Note } from "./order.model";

export class Customer {
    id: string;
    name: string;
    email: string;
    contact: string;
    gstin: string;
    notes: Note[];
}