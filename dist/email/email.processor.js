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
const email_schemas_1 = require("./schemas/email.schemas");
const mailer_util_1 = require("./mailer.util");
let EmailProcessor = class EmailProcessor extends bullmq_1.WorkerHost {
    constructor(emailModel) {
        super();
        this.emailModel = emailModel;
    }
    async process(job) {
        let { from, to, templateType, fromName, subject, emailTemplate, offerId, campaignId, mode, smtpConfig, selectedIp, } = job.data;
        console.log('🚀 ~ EmailProcessor ~ process ~ smtpConfig:', smtpConfig);
        const ip = selectedIp?.split('-')[1]?.trim();
        try {
            const transporter = (0, mailer_util_1.createTransporter)(smtpConfig);
            emailTemplate = decodeURIComponent(emailTemplate);
            const headers = {
                'X-Outgoing-IP': ip,
            };
            for (const userEmail of to) {
                try {
                    console.log(`Sending email to ${userEmail}`);
                    const info = await transporter.sendMail({
                        from: `${fromName} <${from}>`,
                        to: userEmail,
                        subject: subject,
                        html: templateType === 'html' ? emailTemplate : emailTemplate,
                        headers,
                    });
                    console.log('Email sent:', info.response);
                    const emailRecord = new this.emailModel({
                        from: from,
                        to: userEmail,
                        offerId: offerId,
                        campaignId: campaignId,
                        response: info.response,
                        sentAt: new Date(),
                        mode: mode,
                    });
                    await emailRecord.save();
                }
                catch (e) {
                    console.error(`Failed to send email to ${userEmail}: ${e.message}`);
                    const emailRecord = new this.emailModel({
                        from: from,
                        to: userEmail,
                        offerId: offerId,
                        campaignId: campaignId,
                        response: `Failed: ${e.message}`,
                        sentAt: new Date(),
                        mode: mode,
                    });
                    await emailRecord.save();
                }
            }
        }
        catch (e) {
            console.error(`Failed to send email: ${e.message}`);
            throw new Error(e.message);
        }
    }
};
exports.EmailProcessor = EmailProcessor;
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bullmq_1.Processor)('email-queue'),
    __param(0, (0, mongoose_1.InjectModel)(email_schemas_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map