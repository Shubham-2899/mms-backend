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
exports.EmailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mailer_util_1 = require("./mailer.util");
const email_list_schemas_1 = require("../email_list/schemas/email_list.schemas");
let EmailProcessor = class EmailProcessor extends bullmq_1.WorkerHost {
    constructor(emailModel) {
        super();
        this.emailModel = emailModel;
    }
    async process(job) {
        const { from, templateType, fromName, subject, emailTemplate, offerId, campaignId, mode, smtpConfig, selectedIp, batchSize, delay, } = job.data;
        console.log('🚀 ~ EmailProcessor ~ process ~ job.data:', job.data);
        const ip = selectedIp?.split('-')[1]?.trim();
        const headers = { 'X-Outgoing-IP': ip };
        const transporter = (0, mailer_util_1.createTransporter)(smtpConfig);
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
            if (recipients.length === 0)
                break;
            await Promise.allSettled(recipients.map(async (recipient) => {
                try {
                    const info = await transporter.sendMail({
                        from: `${fromName} <${from}>`,
                        to: recipient.to_email,
                        subject,
                        html: templateType === 'html' ? decodedTemplate : decodedTemplate,
                        headers,
                    });
                    await this.emailModel.updateOne({ _id: recipient._id }, {
                        $set: {
                            status: 'sent',
                            offerId: offerId,
                            from: from,
                            sentAt: new Date(),
                            response: info.response,
                            isProcessed: true,
                        },
                    });
                }
                catch (err) {
                    await this.emailModel.updateOne({ _id: recipient._id }, {
                        $set: {
                            status: 'failed',
                            response: err.message,
                            sentAt: new Date(),
                            isProcessed: true,
                        },
                    });
                }
            }));
            await new Promise((res) => setTimeout(res, delay * 1000));
        }
        console.log(`✅ Campaign ${campaignId} email sending completed.`);
    }
};
exports.EmailProcessor = EmailProcessor;
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bullmq_1.Processor)('email-queue'),
    __param(0, (0, mongoose_1.InjectModel)(email_list_schemas_1.EmailList.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map