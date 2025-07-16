import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
  CampaignEmailTracking,
  CampaignEmailTrackingDocument,
} from './schemas/campaign.schemas';
import { Email, EmailDocument } from 'src/email/schemas/email.schemas';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { FirebaseService } from 'src/auth/firebase.service';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { createTransporter } from 'src/email/mailer.util';

@Injectable()
export class CampaignService {
  constructor(
    @InjectQueue('campaign-queue') private campaignQueue: Queue,
    @InjectQueue('email-queue') private emailQueue: Queue,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(CampaignEmailTracking.name)
    private emailTrackingModel: Model<CampaignEmailTrackingDocument>,
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private firebaseService: FirebaseService,
  ) {}

  // Method to fetch SMTP details based on user ID
  private async fetchSmtpDetails(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ firebaseUid: userId });

      if (!user) {
        throw new Error('User not found');
      }

      return user?.serverData;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch SMTP details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
    firebaseToken: string,
  ) {
    try {
      // Verify Firebase token and retrieve user ID
      const res = await this.firebaseService.verifyToken(firebaseToken);

      // Fetch the SMTP details using the userId (uid)
      const serverData = await this.fetchSmtpDetails(res.uid);

      const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();
      const ip = createCampaignDto.selectedIp?.split('-')[1]?.trim();

      const smtpConfig = {
        host: `mail.${domain}`,
        user: `admin@${domain}`,
      };

      if (createCampaignDto.mode === 'test') {
        console.log('here in test');
        return await this.testEmails(createCampaignDto, smtpConfig);
      } else if (createCampaignDto.mode === 'manual') {
        console.log('here manual mode');
        // Manual mode: enqueue jobs to email-queue for each recipient
        if (!createCampaignDto.to || createCampaignDto.to.length === 0) {
          console.log('No recipients provided for manual mode');
          throw new HttpException(
            'No recipients provided for manual mode',
            HttpStatus.BAD_REQUEST,
          );
        }

        const res = await this.emailQueue.add('send-email-job', {
          ...createCampaignDto,
          smtpConfig,
          mode: 'manual',
        });

        return {
          message: 'Manual email jobs added to email queue successfully',
          success: true,
          jobId: res.id,
        };
      } else {
        return await this.startCampaign(createCampaignDto, smtpConfig);
      }
    } catch (error) {
      console.error('🚀 ~ CampaignService ~ createCampaign ~ error:', error);

      if (error instanceof HttpException) {
        // Re-throw expected exceptions (like 400) as-is
        throw error;
      }

      // Only throw 500 for truly unexpected errors
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async startCampaign(createCampaignDto: CreateCampaignDto, smtpConfig: any) {
    console.log('Start campaign');
    // Check for recipients in CampaignEmailTracking
    const recipientCount = await this.emailTrackingModel.countDocuments({
      campaignId: createCampaignDto.campaignId,
      status: 'pending',
    });
    if (recipientCount === 0) {
      throw new HttpException(
        'No recipients found for this campaign. Either recipients are not added or campaign is already completed',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Save campaign details
    await this.campaignModel.findOneAndUpdate(
      { campaignId: createCampaignDto.campaignId },
      {
        ...createCampaignDto,
        status: 'running',
        startedAt: new Date(),
      },
      { upsert: true },
    );

    // Add job to BullMQ campaign queue
    const job = await this.campaignQueue.add('send-campaign-job', {
      ...createCampaignDto,
      smtpConfig,
    });

    // Update campaign with job ID
    await this.campaignModel.findOneAndUpdate(
      { campaignId: createCampaignDto.campaignId },
      { jobId: job.id },
    );

    return {
      message: 'Campaign started successfully',
      success: true,
      jobId: job.id,
    };
  }

  async pauseCampaign(campaignId: string) {
    await this.campaignModel.findOneAndUpdate(
      { campaignId },
      { status: 'paused' },
    );
    return { message: 'Campaign paused', success: true };
  }

  async resumeCampaign(createCampaignDto: CreateCampaignDto, smtpConfig: any) {
    if (createCampaignDto.mode === 'manual') {
      // Manual mode is not supported for resume
      throw new HttpException(
        'Manual mode is only supported during campaign creation.',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // Update all campaign fields on resume
      await this.campaignModel.findOneAndUpdate(
        { campaignId: createCampaignDto.campaignId },
        {
          ...createCampaignDto,
          status: 'running',
        },
      );

      const job = await this.campaignQueue.add('send-campaign-job', {
        ...createCampaignDto,
        smtpConfig,
      });

      await this.campaignModel.findOneAndUpdate(
        { campaignId: createCampaignDto.campaignId },
        { jobId: job.id },
      );

      return { message: 'Campaign resumed', success: true, jobId: job.id };
    }
  }

  async resumeCampaignWithToken(
    createCampaignDto: CreateCampaignDto,
    firebaseToken: string,
  ) {
    try {
      console.log(`Resume ${createCampaignDto.campaignId} campaign`);
      // Verify Firebase token and retrieve user ID
      const res = await this.firebaseService.verifyToken(firebaseToken);

      // Fetch the SMTP details using the userId (uid)
      const serverData = await this.fetchSmtpDetails(res.uid);

      const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();

      const smtpConfig = {
        host: `mail.${domain}`,
        user: `admin@${domain}`,
      };

      return await this.resumeCampaign(createCampaignDto, smtpConfig);
    } catch (error) {
      console.log(
        '🚀 ~ CampaignService ~ resumeCampaignWithToken ~ error:',
        error,
      );
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async testEmails(createCampaignDto: CreateCampaignDto, smtpConfig: any) {
    const {
      from,
      fromName,
      subject,
      // templateType,
      emailTemplate,
      offerId,
      campaignId,
      to,
      selectedIp,
    } = createCampaignDto;

    const decodedTemplate = decodeURIComponent(emailTemplate);
    const ip = selectedIp?.split('-')[1]?.trim();
    const headers = { 'X-Outgoing-IP': ip };
    const transporter = createTransporter(smtpConfig);

    const failed: string[] = [];
    const sent: string[] = [];

    if (to.length === 0) {
      throw new HttpException(
        'No recipients found, Please add recipients',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const email of to) {
      try {
        const info = await transporter.sendMail({
          from: `${fromName} <${from}>`,
          to: email,
          subject,
          html: decodedTemplate,
          headers,
        });

        // Save to emails collection for reports
        await this.emailModel.create({
          from,
          to: email,
          offerId,
          campaignId,
          sentAt: new Date(),
          response: info.response,
          mode: 'test',
        });

        /**
         * Update tracking status - this can be used to display total number of emails sent in test mode for given campaign
         * to check the quality of sending by the user
         *
         * */
        // await this.emailTrackingModel.findOneAndUpdate(
        //   { to_email: email, campaignId },
        //   {
        //     status: 'sent',
        //     sentAt: new Date(),
        //     isProcessed: true,
        //   },
        //   { upsert: true },
        // );

        sent.push(email);
      } catch (err) {
        // Save to emails collection for reports
        await this.emailModel.create({
          from,
          to: email,
          offerId,
          campaignId,
          sentAt: new Date(),
          response: err.message,
          mode: 'test',
        });

        // Update tracking status
        // await this.emailTrackingModel.findOneAndUpdate(
        //   { to_email: email, campaignId },
        //   {
        //     status: 'failed',
        //     sentAt: new Date(),
        //     errorMessage: err.message,
        //     isProcessed: true,
        //   },
        //   { upsert: true },
        // );

        failed.push(email);
      }
    }

    return {
      message:
        failed.length > 0
          ? 'Some emails failed'
          : 'All emails sent successfully',
      success: failed.length === 0,
      sent,
      failed,
      emailSent: sent.length,
      emailFailed: failed.length,
    };
  }

  async getCampaignStats(campaignId: string) {
    // Try to get real-time stats from tracking model
    const [sent, failed, pending] = await Promise.all([
      this.emailTrackingModel.countDocuments({ campaignId, status: 'sent' }),
      this.emailTrackingModel.countDocuments({ campaignId, status: 'failed' }),
      this.emailTrackingModel.countDocuments({ campaignId, status: 'pending' }),
    ]);
    const campaign = await this.campaignModel.findOne({ campaignId });
    const trackingDataExists = sent + failed + pending > 0;

    let counts, totalEmails, sentEmails, failedEmails;
    if (trackingDataExists) {
      counts = { sent, failed, pending, total: sent + failed + pending };
      totalEmails = sent + failed + pending;
      sentEmails = sent;
      failedEmails = failed;
    } else if (
      campaign &&
      (campaign.sentEmails || campaign.failedEmails || campaign.totalEmails)
    ) {
      // Use persisted stats if tracking data is gone
      counts = {
        sent: campaign.sentEmails || 0,
        failed: campaign.failedEmails || 0,
        pending: 0,
        total: campaign.totalEmails || 0,
      };
      totalEmails = campaign.totalEmails || 0;
      sentEmails = campaign.sentEmails || 0;
      failedEmails = campaign.failedEmails || 0;
    } else {
      // No stats found at all
      // throw new HttpException('No stats found for this campaign. Please contact admin.', HttpStatus.NOT_FOUND);
      counts = { sent: 0, failed: 0, pending: 0, total: 0 };
      totalEmails = 0;
      sentEmails = 0;
      failedEmails = 0;
    }

    return {
      campaignId,
      status: campaign?.status || 'unknown',
      counts,
      campaign: campaign
        ? {
            from: campaign.from,
            fromName: campaign.fromName,
            subject: campaign.subject,
            offerId: campaign.offerId,
            selectedIp: campaign.selectedIp,
            batchSize: campaign.batchSize,
            templateType: campaign.templateType,
            emailTemplate: campaign.emailTemplate,
            delay: campaign.delay,
            startedAt: campaign.startedAt,
            completedAt: campaign.completedAt,
            totalEmails,
            sentEmails,
            failedEmails,
          }
        : null,
    };
  }

  async getAllCampaigns() {
    const campaigns = await this.campaignModel.find().sort({ createdAt: -1 });

    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await this.getCampaignStats(campaign.campaignId);
        return {
          ...campaign.toObject(),
          stats: stats.counts,
        };
      }),
    );

    return campaignsWithStats;
  }

  async stopJob(jobId: string) {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (job) {
        await job.remove();
        return { message: 'Job stopped successfully', success: true };
      }
      return { message: 'Job not found', success: false };
    } catch (error) {
      throw new HttpException(
        'Failed to stop job',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Manual cleanup of campaign tracking data
  async cleanupCampaignData(campaignId: string) {
    try {
      const campaign = await this.campaignModel.findOne({ campaignId });
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'completed') {
        throw new Error('Campaign must be completed before cleanup');
      }

      //Not required as count will be updated in the campaign processor after completion of campaign
      //Keeping it for future reference
      // Calculate stats before cleanup
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
        },
      );

      // Delete tracking data for completed campaigns
      const result = await this.emailTrackingModel.deleteMany({
        campaignId,
        status: { $in: ['sent', 'failed'] },
      });

      return {
        message: 'Campaign data cleaned up successfully',
        success: true,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get campaign cleanup status
  async getCampaignCleanupStatus(campaignId: string) {
    const [campaign, trackingCount] = await Promise.all([
      this.campaignModel.findOne({ campaignId }),
      this.emailTrackingModel.countDocuments({ campaignId }),
    ]);

    return {
      campaignId,
      status: campaign?.status || 'unknown',
      trackingDataCount: trackingCount,
      needsCleanup: campaign?.status === 'completed' && trackingCount > 0,
    };
  }
}
