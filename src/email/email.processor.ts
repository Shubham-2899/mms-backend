import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Email, EmailDocument } from './schemas/email.schemas';
import { createTransporter } from './mailer.util';
@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {
    super();
  }

  async process(job: Job<any>) {
    let {
      from,
      to,
      templateType,
      fromName,
      subject,
      emailTemplate,
      offerId,
      campaignId,
      mode,
      smtpConfig,
      selectedIp,
    } = job.data;
    console.log('🚀 ~ EmailProcessor ~ process ~ smtpConfig:', smtpConfig);
    const ip = selectedIp?.split('-')[1]?.trim();
    const domain = selectedIp?.split('-')[0]?.trim();

    // Setup SMTP for each user (dynamically based on user)
    // const transporter = nodemailer.createTransport({
    //   host: smtpConfig.host,
    //   pool: true, // Connection pooling enabled
    //   secure: false, // Not using port 465
    //   port: 587,
    //   tls: {
    //     rejectUnauthorized: false, // Disable TLS verification (consider setting to true in production)
    //   },
    //   auth: {
    //     user: smtpConfig.user,
    //     pass: `${process.env.ROOT_MAIL_USER_PASSWORD}`,
    //   },
    //   logger: true, // Log SMTP actions
    //   // debug: true, // Enable debugging for troubleshooting
    //   maxConnections: 5, // Max 5 connections at a time
    //   maxMessages: 100, // Max 100 emails per connection
    //   rateLimit: 10, // Max 10 emails per second
    //   connectionTimeout: 2 * 60 * 1000, // 2 minutes connection timeout
    //   greetingTimeout: 30 * 1000, // 30 seconds greeting timeout
    //   socketTimeout: 5 * 60 * 1000, // 5 minutes socket timeout
    // });

    try {
      const transporter = createTransporter(smtpConfig);
      emailTemplate = decodeURIComponent(emailTemplate);
      const headers = {
        'X-Outgoing-IP': ip,
      };

      for (const userEmail of to) {
        try {
          console.log(`Sending email to ${userEmail}`);
          // Send the email using user's SMTP configuration
          const info = await transporter.sendMail({
            from: `${fromName} <${from}>`,
            to: userEmail,
            subject: subject,
            html: templateType === 'html' ? emailTemplate : emailTemplate,
            headers,
            envelope: {
              from: `bounces@${domain}`,
              to: userEmail,
            },
          });

          console.log('Email sent:', info.response);

          // Save email to database
          const emailRecord = new this.emailModel({
            from: from,
            to: userEmail,
            offerId: offerId,
            campaignId: campaignId,
            response: info.response,
            sentAt: new Date(),
            mode: mode,
            domainUsed: domain,
            ipUsed: ip,
          });

          await emailRecord.save();
        } catch (e) {
          console.error(`Failed to send email to ${userEmail}: ${e.message}`);
          // Optionally save failed email attempts with a status or error message
          const emailRecord = new this.emailModel({
            from: from,
            to: userEmail,
            offerId: offerId,
            campaignId: campaignId,
            response: `Failed: ${e.message}`,
            sentAt: new Date(),
            mode: mode,
            domainUsed: domain,
            ipUsed: ip,
          });
          await emailRecord.save();
        }
      }
    } catch (e) {
      console.error(`Failed to send email: ${e.message}`);
      throw new Error(e.message);
    }
  }
}
