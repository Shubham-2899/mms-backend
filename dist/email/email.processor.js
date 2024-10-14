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
const nodemailer = require("nodemailer");
const email_schemas_1 = require("./schemas/email.schemas");
let EmailProcessor = class EmailProcessor extends bullmq_1.WorkerHost {
    constructor(emailModel) {
        super();
        this.emailModel = emailModel;
    }
    async process(job) {
        let { from, to, templateType, fromName, subject, emailTemplate, offerId, campaignId, smtpConfig, } = job.data;
        console.log('🚀 ~ EmailProcessor ~ process ~ smtpConfig:', smtpConfig);
        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            pool: true,
            secure: false,
            port: 587,
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.password,
            },
            logger: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            connectionTimeout: 2 * 60 * 1000,
            greetingTimeout: 30 * 1000,
            socketTimeout: 5 * 60 * 1000,
        });
        try {
            for (const userEmail of to) {
                console.log(`Sending email to ${userEmail}`);
                emailTemplate = decodeURIComponent(emailTemplate);
                const info = await transporter.sendMail({
                    from: `${fromName} <${from}>`,
                    to: userEmail,
                    subject: subject,
                    html: templateType === 'html' ? emailTemplate : emailTemplate,
                });
                console.log('Email sent:', info.response);
                const emailRecord = new this.emailModel({
                    from: from,
                    to: userEmail,
                    offerId: offerId,
                    campaignId: campaignId,
                    response: info.response,
                    sentAt: new Date(),
                });
                await emailRecord.save();
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