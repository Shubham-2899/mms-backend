import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Email, EmailDocument } from './schemas/email.schemas';
import { createTransporter } from './mailer.util';
import {
  EmailListDocument,
  EmailList,
} from 'src/email_list/schemas/email_list.schemas';
@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  constructor(
    @InjectModel(EmailList.name) private emailModel: Model<EmailListDocument>,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const {
      from,
      templateType,
      fromName,
      subject,
      emailTemplate,
      offerId,
      campaignId,
      mode,
      smtpConfig,
      selectedIp,
      batchSize,
      delay,
    } = job.data;
    console.log('🚀 ~ EmailProcessor ~ process ~ job.data:', job.data);

    const ip = selectedIp?.split('-')[1]?.trim();
    const headers = { 'X-Outgoing-IP': ip };
    const transporter = createTransporter(smtpConfig);
    const decodedTemplate = decodeURIComponent(emailTemplate);

    while (true) {
      const recipients = await this.emailModel
        .find({
          campaignId: campaignId,
          status: 'pending',
        })
        .limit(batchSize);

      const pendingCount = await this.emailModel.countDocuments({
        status: 'pending',
      });
      console.log(`Total pending emails in the system: ${pendingCount}`);

      console.log('🚀 ~ EmailProcessor ~ process ~ recipients:', recipients);

      if (recipients.length === 0) break;

      await Promise.allSettled(
        recipients.map(async (recipient) => {
          try {
            const info = await transporter.sendMail({
              from: `${fromName} <${from}>`,
              to: recipient.to_email,
              subject,
              html: templateType === 'html' ? decodedTemplate : decodedTemplate,
              headers,
            });

            await this.emailModel.updateOne(
              { _id: recipient._id },
              {
                $set: {
                  status: 'sent',
                  offerId: offerId,
                  from: from,
                  sentAt: new Date(),
                  response: info.response,
                  isProcessed: true, // ✅ mark as processed
                },
              },
            );
          } catch (err) {
            await this.emailModel.updateOne(
              { _id: recipient._id },
              {
                $set: {
                  status: 'failed',

                  response: err.message,
                  sentAt: new Date(),
                  isProcessed: true, // ✅ still mark as processed
                },
              },
            );
          }
        }),
      );

      await new Promise((res) => setTimeout(res, delay * 1000));
    }

    console.log(`✅ Campaign ${campaignId} email sending completed.`);
  }
}
