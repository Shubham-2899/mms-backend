"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const campaign_schemas_1 = require("./schemas/campaign.schemas");
const email_schemas_1 = require("../email/schemas/email.schemas");
const firebase_service_1 = require("../auth/firebase.service");
const user_schema_1 = require("../user/schemas/user.schema");
const mailer_util_1 = require("../email/mailer.util");
let CampaignService = class CampaignService {
    constructor(campaignQueue, emailQueue, campaignModel, emailTrackingModel, emailModel, userModel, firebaseService) {
        this.campaignQueue = campaignQueue;
        this.emailQueue = emailQueue;
        this.campaignModel = campaignModel;
        this.emailTrackingModel = emailTrackingModel;
        this.emailModel = emailModel;
        this.userModel = userModel;
        this.firebaseService = firebaseService;
    }
    async fetchSmtpDetails(userId) {
        try {
            const user = await this.userModel.findOne({ firebaseUid: userId });
            if (!user) {
                throw new Error('User not found');
            }
            return user?.serverData;
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch SMTP details', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createCampaign(createCampaignDto, firebaseToken) {
        try {
            const res = await this.firebaseService.verifyToken(firebaseToken);
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
            }
            else if (createCampaignDto.mode === 'manual') {
                console.log('here manual mode');
                if (!createCampaignDto.to || createCampaignDto.to.length === 0) {
                    console.log('No recipients provided for manual mode');
                    throw new common_1.HttpException('No recipients provided for manual mode', common_1.HttpStatus.BAD_REQUEST);
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
            }
            else {
                return await this.startCampaign(createCampaignDto, smtpConfig);
            }
        }
        catch (error) {
            console.error('🚀 ~ CampaignService ~ createCampaign ~ error:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async startCampaign(createCampaignDto, smtpConfig) {
        console.log('Start campaign');
        const recipientCount = await this.emailTrackingModel.countDocuments({
            campaignId: createCampaignDto.campaignId,
            status: 'pending',
        });
        if (recipientCount === 0) {
            throw new common_1.HttpException('No recipients found for this campaign. Either recipients are not added or campaign is already completed', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.campaignModel.findOneAndUpdate({ campaignId: createCampaignDto.campaignId }, {
            ...createCampaignDto,
            status: 'running',
            startedAt: new Date(),
        }, { upsert: true });
        const job = await this.campaignQueue.add('send-campaign-job', {
            ...createCampaignDto,
            smtpConfig,
        });
        await this.campaignModel.findOneAndUpdate({ campaignId: createCampaignDto.campaignId }, { jobId: job.id });
        return {
            message: 'Campaign started successfully',
            success: true,
            jobId: job.id,
        };
    }
    async pauseCampaign(campaignId) {
        await this.campaignModel.findOneAndUpdate({ campaignId }, { status: 'paused' });
        return { message: 'Campaign paused', success: true };
    }
    async resumeCampaign(createCampaignDto, smtpConfig) {
        if (createCampaignDto.mode === 'manual') {
            throw new common_1.HttpException('Manual mode is only supported during campaign creation.', common_1.HttpStatus.BAD_REQUEST);
        }
        else {
            await this.campaignModel.findOneAndUpdate({ campaignId: createCampaignDto.campaignId }, {
                ...createCampaignDto,
                status: 'running',
            });
            const job = await this.campaignQueue.add('send-campaign-job', {
                ...createCampaignDto,
                smtpConfig,
            });
            await this.campaignModel.findOneAndUpdate({ campaignId: createCampaignDto.campaignId }, { jobId: job.id });
            return { message: 'Campaign resumed', success: true, jobId: job.id };
        }
    }
    async resumeCampaignWithToken(createCampaignDto, firebaseToken) {
        try {
            console.log(`Resume ${createCampaignDto.campaignId} campaign`);
            const res = await this.firebaseService.verifyToken(firebaseToken);
            const serverData = await this.fetchSmtpDetails(res.uid);
            const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();
            const smtpConfig = {
                host: `mail.${domain}`,
                user: `admin@${domain}`,
            };
            return await this.resumeCampaign(createCampaignDto, smtpConfig);
        }
        catch (error) {
            console.log('🚀 ~ CampaignService ~ resumeCampaignWithToken ~ error:', error);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async testEmails(createCampaignDto, smtpConfig) {
        const { from, fromName, subject, emailTemplate, offerId, campaignId, to, selectedIp, } = createCampaignDto;
        const decodedTemplate = decodeURIComponent(emailTemplate);
        const ip = selectedIp?.split('-')[1]?.trim();
        const headers = { 'X-Outgoing-IP': ip };
        const transporter = (0, mailer_util_1.createTransporter)(smtpConfig);
        const failed = [];
        const sent = [];
        if (to.length === 0) {
            throw new common_1.HttpException('No recipients found, Please add recipients', common_1.HttpStatus.BAD_REQUEST);
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
                await this.emailModel.create({
                    from,
                    to: email,
                    offerId,
                    campaignId,
                    sentAt: new Date(),
                    response: info.response,
                    mode: 'test',
                });
                sent.push(email);
            }
            catch (err) {
                await this.emailModel.create({
                    from,
                    to: email,
                    offerId,
                    campaignId,
                    sentAt: new Date(),
                    response: err.message,
                    mode: 'test',
                });
                failed.push(email);
            }
        }
        return {
            message: failed.length > 0
                ? 'Some emails failed'
                : 'All emails sent successfully',
            success: failed.length === 0,
            sent,
            failed,
            emailSent: sent.length,
            emailFailed: failed.length,
        };
    }
    async getCampaignStats(campaignId) {
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
        }
        else if (campaign &&
            (campaign.sentEmails || campaign.failedEmails || campaign.totalEmails)) {
            counts = {
                sent: campaign.sentEmails || 0,
                failed: campaign.failedEmails || 0,
                pending: 0,
                total: campaign.totalEmails || 0,
            };
            totalEmails = campaign.totalEmails || 0;
            sentEmails = campaign.sentEmails || 0;
            failedEmails = campaign.failedEmails || 0;
        }
        else {
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
        const campaignsWithStats = await Promise.all(campaigns.map(async (campaign) => {
            const stats = await this.getCampaignStats(campaign.campaignId);
            return {
                ...campaign.toObject(),
                stats: stats.counts,
            };
        }));
        return campaignsWithStats;
    }
    async stopJob(jobId) {
        try {
            const job = await this.emailQueue.getJob(jobId);
            if (job) {
                await job.remove();
                return { message: 'Job stopped successfully', success: true };
            }
            return { message: 'Job not found', success: false };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to stop job', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cleanupCampaignData(campaignId) {
        try {
            const campaign = await this.campaignModel.findOne({ campaignId });
            if (!campaign) {
                throw new Error('Campaign not found');
            }
            if (campaign.status !== 'completed') {
                throw new Error('Campaign must be completed before cleanup');
            }
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
            await this.campaignModel.updateOne({ campaignId }, {
                sentEmails: sent,
                failedEmails: failed,
                totalEmails: total,
            });
            const result = await this.emailTrackingModel.deleteMany({
                campaignId,
                status: { $in: ['sent', 'failed'] },
            });
            return {
                message: 'Campaign data cleaned up successfully',
                success: true,
                deletedCount: result.deletedCount,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCampaignCleanupStatus(campaignId) {
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
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('campaign-queue')),
    __param(1, (0, bullmq_1.InjectQueue)('email-queue')),
    __param(2, (0, mongoose_1.InjectModel)(campaign_schemas_1.Campaign.name)),
    __param(3, (0, mongoose_1.InjectModel)(campaign_schemas_1.CampaignEmailTracking.name)),
    __param(4, (0, mongoose_1.InjectModel)(email_schemas_1.Email.name)),
    __param(5, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        firebase_service_1.FirebaseService])
], CampaignService);
//# sourceMappingURL=campaign.service.js.map