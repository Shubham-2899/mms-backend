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
}) => any;
export declare const sendEmail: (transporter: nodemailer.Transporter, options: SendMailOptions) => unknown;
export {};
