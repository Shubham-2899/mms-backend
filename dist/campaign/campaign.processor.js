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
exports.CampaignProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const campaign_schemas_1 = require("./schemas/campaign.schemas");
const email_schemas_1 = require("../email/schemas/email.schemas");
const mailer_util_1 = require("../email/mailer.util");
let CampaignProcessor = class CampaignProcessor extends bullmq_1.WorkerHost {
    constructor(emailTrackingModel, campaignModel, emailModel) {
        super();
        this.emailTrackingModel = emailTrackingModel;
        this.campaignModel = campaignModel;
        this.emailModel = emailModel;
    }
    async process(job) {
        const { campaignId, batchSize, delay, smtpConfig, from, fromName, subject, emailTemplate, offerId, selectedIp, } = job.data;
        console.log('🚀 ~ CampaignProcessor ~ process ~ job.data:', job.data);
        const transporter = (0, mailer_util_1.createTransporter)(smtpConfig);
        const decodedTemplate = decodeURIComponent(emailTemplate);
        const ip = selectedIp?.split('-')[1]?.trim();
        const headers = { 'X-Outgoing-IP': ip };
        const delayBetweenEmailsMs = 100;
        let campaignCompleted = false;
        while (true) {
            const campaign = await this.campaignModel.findOne({ campaignId });
            if (!campaign || campaign.status !== 'running') {
                console.log(`⏹️ Campaign ${campaignId} is not running, stopping processor.`);
                break;
            }
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
            console.log(`📧 Processing ${recipients.length} emails for campaign ${campaignId}`);
            const emailRecords = [];
            const trackingUpdates = [];
            let count = 0;
            for (const recipient of recipients) {
                if (count % 3 === 0) {
                    const statusCheck = await this.campaignModel
                        .findOne({ campaignId })
                        .lean();
                    if (!statusCheck || statusCheck.status !== 'running') {
                        console.log('⏹️ Paused mid-batch (hybrid check), flushing partial results and stopping early.');
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
                    emailRecords.push({
                        from,
                        to: recipient.to_email,
                        offerId,
                        campaignId,
                        sentAt: new Date(),
                        response: info.response,
                        mode: 'bulk',
                    });
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
                }
                catch (err) {
                    emailRecords.push({
                        from,
                        to: recipient.to_email,
                        offerId,
                        campaignId,
                        sentAt: new Date(),
                        response: err.message,
                        mode: 'bulk',
                    });
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
                    console.warn(`❌ Failed to send to ${recipient.to_email}: ${err.message}`);
                }
                count++;
                await new Promise((res) => setTimeout(res, delayBetweenEmailsMs));
            }
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
        if (campaignCompleted) {
            await this.campaignModel.updateOne({ campaignId }, {
                status: 'completed',
                completedAt: new Date(),
                pendingEmails: 0,
            });
            await this.cleanupCampaignData(campaignId);
            console.log(`✅ Campaign ${campaignId} email sending completed.`);
        }
        else {
            console.log(`⏸️ Campaign ${campaignId} was paused, not marking as completed.`);
        }
    }
    async cleanupCampaignData(campaignId) {
        try {
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
                pendingEmails: pending,
            });
            await this.emailTrackingModel.deleteMany({
                campaignId,
                status: { $in: ['sent', 'failed'] },
            });
            console.log(`🧹 Cleaned up tracking data for campaign ${campaignId}`);
        }
        catch (error) {
            console.error(`❌ Error cleaning up campaign data: ${error.message}`);
        }
    }
};
exports.CampaignProcessor = CampaignProcessor;
exports.CampaignProcessor = CampaignProcessor = __decorate([
    (0, bullmq_1.Processor)('campaign-queue'),
    __param(0, (0, mongoose_1.InjectModel)(campaign_schemas_1.CampaignEmailTracking.name)),
    __param(1, (0, mongoose_1.InjectModel)(campaign_schemas_1.Campaign.name)),
    __param(2, (0, mongoose_1.InjectModel)(email_schemas_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CampaignProcessor);
//# sourceMappingURL=campaign.processor.js.map