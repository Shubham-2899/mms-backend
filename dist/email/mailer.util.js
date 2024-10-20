"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.createTransporter = void 0;
const nodemailer = require("nodemailer");
const createTransporter = (smtpConfig) => {
    console.log('inside util createTransporter');
    return nodemailer.createTransport({
        host: smtpConfig.host,
        pool: true,
        secure: false,
        port: 587,
        tls: {
            rejectUnauthorized: false,
        },
        auth: {
            user: smtpConfig.user,
            pass: `${process.env.ROOT_MAIL_USER_PASSWORD}`,
        },
        logger: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10,
        connectionTimeout: 2 * 60 * 1000,
        greetingTimeout: 30 * 1000,
        socketTimeout: 5 * 60 * 1000,
    });
};
exports.createTransporter = createTransporter;
const sendEmail = async (transporter, options) => {
    const { from, to, subject, html, fromName } = options;
    console.log('inside util sendMail');
    try {
        const info = await transporter.sendMail({
            from: fromName ? `${fromName} <${from}>` : from,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: subject,
            html: html,
        });
        console.log('Email sent:', info.response);
        return info.response;
    }
    catch (error) {
        console.error('Error while sending email:', error.message);
        throw new Error(error.message);
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.util.js.map