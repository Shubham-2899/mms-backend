import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
  CampaignEmailTracking,
  CampaignEmailTrackingDocument,
} from './schemas/campaign.schemas';
import { Email, EmailDocument } from 'src/email/schemas/email.schemas';
import { createTransporter } from 'src/email/mailer.util';

@Processor('campaign-queue')
export class CampaignProcessor extends WorkerHost {
  constructor(
    @InjectModel(CampaignEmailTracking.name)
    private emailTrackingModel: Model<CampaignEmailTrackingDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const {
      campaignId,
      batchSize,
      delay,
      smtpConfig,
      from,
      fromName,
      subject,
      emailTemplate,
      offerId,
      selectedIp,
    } = job.data;

    console.log('🚀 ~ CampaignProcessor ~ process ~ job.data:', job.data);

    const transporter = createTransporter(smtpConfig);
    const decodedTemplate = decodeURIComponent(emailTemplate);
    const ip = selectedIp?.split('-')[1]?.trim();
    const domain = selectedIp?.split('-')[0]?.trim();
    const headers = { 'X-Outgoing-IP': ip };

    const delayBetweenEmailsMs = 100;

    let campaignCompleted = false;

    while (true) {
      // Check campaign status before processing
      const campaign = await this.campaignModel.findOne({ campaignId });
      if (!campaign || campaign.status !== 'running') {
        console.log(
          `⏹️ Campaign ${campaignId} is not running, stopping processor.`,
        );
        break;
      }

      // Get pending emails for this campaign
      const recipients = await this.emailTrackingModel
        .find({
          campaignId,
          status: 'pending',
          isProcessed: false,
        })
        .limit(batchSize)
        .lean();

      if (!recipients.length) {
        console.log(`✅ No more pending emails for campaign ${campaignId}`);
        campaignCompleted = true;
        break;
      }

      console.log(
        `📧 Processing ${recipients.length} emails for campaign ${campaignId}`,
      );

      // Prepare bulk operations for better performance
      const emailRecords = [];
      const trackingUpdates = [];
      let count = 0;

      for (const recipient of recipients) {
        // Hybrid pause check - check status every 3 emails
        if (count % 3 === 0) {
          const statusCheck = await this.campaignModel
            .findOne({ campaignId })
            .lean();
          if (!statusCheck || statusCheck.status !== 'running') {
            console.log(
              '⏹️ Paused mid-batch (hybrid check), flushing partial results and stopping early.',
            );

            // Flush partial batch results
            if (emailRecords.length > 0) {
              await Promise.all([
                this.emailModel.insertMany(emailRecords),
                this.emailTrackingModel.bulkWrite(trackingUpdates),
              ]);
            }

            return;
          }
        }

        try {
          const info = await transporter.sendMail({
            from: `${fromName} <${from}>`,
            to: recipient.to_email,
            subject,
            html: decodedTemplate,
            headers,
          });

          // Prepare email record for bulk insert
          emailRecords.push({
            from,
            to: recipient.to_email,
            offerId,
            campaignId,
            sentAt: new Date(),
            response: info.response,
            mode: 'bulk',
            domainUsed: domain,
            ipUsed: ip,
          });

          // Prepare tracking update for bulk operation
          trackingUpdates.push({
            updateOne: {
              filter: { _id: recipient._id },
              update: {
                $set: {
                  status: 'sent',
                  sentAt: new Date(),
                  isProcessed: true,
                },
              },
            },
          });

          console.log(`✅ Sent to ${recipient.to_email}`);
        } catch (err) {
          // Prepare email record for bulk insert (failed)
          emailRecords.push({
            from,
            to: recipient.to_email,
            offerId,
            campaignId,
            sentAt: new Date(),
            response: err.message,
            mode: 'bulk',
            domainUsed: domain,
            ipUsed: ip,
          });

          // Prepare tracking update for bulk operation (failed)
          trackingUpdates.push({
            updateOne: {
              filter: { _id: recipient._id },
              update: {
                $set: {
                  status: 'failed',
                  sentAt: new Date(),
                  errorMessage: err.message,
                  isProcessed: true,
                },
              },
            },
          });

          console.warn(
            `❌ Failed to send to ${recipient.to_email}: ${err.message}`,
          );
        }

        count++;
        // Small delay between individual emails to prevent rate limiting
        await new Promise((res) => setTimeout(res, delayBetweenEmailsMs));
      }

      // Bulk operations - only 2 queries instead of 5 per email
      const operations = [];

      if (emailRecords.length > 0) {
        operations.push(this.emailModel.insertMany(emailRecords));
      }

      if (trackingUpdates.length > 0) {
        operations.push(this.emailTrackingModel.bulkWrite(trackingUpdates));
      }

      if (operations.length > 0) {
        await Promise.all(operations);
      }

      console.log(`⏳ Waiting ${delay} seconds before next batch...`);
      await new Promise((res) => setTimeout(res, delay * 1000));
    }

    // Only mark as completed if campaign actually finished all emails
    if (campaignCompleted) {
      // Mark campaign as completed
      await this.campaignModel.updateOne(
        { campaignId },
        {
          status: 'completed',
          completedAt: new Date(),
          pendingEmails: 0,
        },
      );

      // Clean up campaign tracking data after completion
      await this.cleanupCampaignData(campaignId);

      console.log(`✅ Campaign ${campaignId} email sending completed.`);
    } else {
      console.log(
        `⏸️ Campaign ${campaignId} was paused, not marking as completed.`,
      );
    }
  }

  // Clean up campaign tracking data after completion
  private async cleanupCampaignData(campaignId: string) {
    try {
      // Persist stats in the campaign document
      const [sent, failed, pending] = await Promise.all([
        this.emailTrackingModel.countDocuments({ campaignId, status: 'sent' }),
        this.emailTrackingModel.countDocuments({
          campaignId,
          status: 'failed',
        }),
        this.emailTrackingModel.countDocuments({
          campaignId,
          status: 'pending',
        }),
      ]);
      const total = sent + failed + pending;

      // Persist stats in the campaign document
      await this.campaignModel.updateOne(
        { campaignId },
        {
          sentEmails: sent,
          failedEmails: failed,
          totalEmails: total,
          pendingEmails: pending,
        },
      );

      // Option 1: Delete all tracking data (recommended for completed campaigns)
      await this.emailTrackingModel.deleteMany({
        campaignId,
        status: { $in: ['sent', 'failed'] },
      });

      // Option 2: Archive tracking data (if you want to keep it for audit)
      // await this.emailTrackingModel.updateMany(
      //   { campaignId },
      //   { $set: { archived: true, archivedAt: new Date() } }
      // );

      console.log(`🧹 Cleaned up tracking data for campaign ${campaignId}`);
    } catch (error) {
      console.error(`❌ Error cleaning up campaign data: ${error.message}`);
    }
  }
}
