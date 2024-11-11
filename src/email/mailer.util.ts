// src/utils/mailer.util.ts
import * as nodemailer from 'nodemailer';

interface SendMailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
}

export const createTransporter = (smtpConfig: {
  user: string;
  // pass: string;
  host: string;
}) => {
  console.log('inside util createTransporter');
  return nodemailer.createTransport({
    host: smtpConfig.host,
    pool: true,
    secure: false,
    port: 587,
    tls: {
      rejectUnauthorized: false, // Disable TLS verification (consider setting to true in production)
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

export const sendEmail = async (
  transporter: nodemailer.Transporter,
  options: SendMailOptions,
) => {
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
  } catch (error) {
    console.error('Error while sending email:', error.message);
    throw new Error(error.message);
  }
};
