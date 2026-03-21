import * as nodemailer from 'nodemailer';
interface SendMailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    fromName?: string;
}
export declare const createTransporter: (smtpConfig: {
    user: string;
    host: string;
}) => nodemailer.Transporter<import("nodemailer/lib/smtp-pool").SentMessageInfo>;
export declare const sendEmail: (transporter: nodemailer.Transporter, options: SendMailOptions) => Promise<any>;
export {};
