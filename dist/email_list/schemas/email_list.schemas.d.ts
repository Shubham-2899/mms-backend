import { Document } from 'mongoose';
export type EmailListDocument = EmailList & Document;
export declare class EmailList {
    email: string;
    unsubscribed_domains: string[];
}
export declare const EmailListSchema: any;
