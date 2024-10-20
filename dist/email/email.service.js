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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schemas_1 = require("./schemas/email.schemas");
const firebase_service_1 = require("../auth/firebase.service");
const user_schema_1 = require("../user/schemas/user.schema");
const mailer_util_1 = require("./mailer.util");
let EmailService = class EmailService {
    constructor(emailQueue, emailModel, userModel, firebaseService) {
        this.emailQueue = emailQueue;
        this.emailModel = emailModel;
        this.userModel = userModel;
        this.firebaseService = firebaseService;
    }
    async create(createEmailDto, firebaseToken) {
        try {
            const res = await this.firebaseService.verifyToken(firebaseToken);
            const smtpConfig = await this.fetchSmtpDetails(res.uid);
            if (createEmailDto.mode === 'test') {
                console.log('inside the test mode');
                let { from, to, templateType, fromName, subject, emailTemplate, offerId, campaignId, } = createEmailDto;
                const transporter = (0, mailer_util_1.createTransporter)(smtpConfig);
                emailTemplate = decodeURIComponent(emailTemplate);
                try {
                    for (const userEmail of to) {
                        console.log(`Sending email to ${userEmail}`);
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
                    return {
                        message: 'Emails processed successfully.',
                        success: true,
                        emailSent: to.length,
                    };
                }
                catch (e) {
                    console.error(`Failed to send email: ${e.message}`);
                    throw new Error(e.message);
                }
            }
            else {
                console.log('inside bulk mode');
                const res = await this.emailQueue.add('send-email-job', {
                    ...createEmailDto,
                    smtpConfig,
                });
                return {
                    message: 'Email job added to queue successfully',
                    success: true,
                    jobId: res.id,
                };
            }
        }
        catch (error) {
            console.log('🚀 ~ EmailService ~ create ~ error:', error);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async fetchSmtpDetails(userId) {
        try {
            const user = await this.userModel.findOne({ firebaseUid: userId });
            if (!user) {
                throw new Error('User not found');
            }
            const parts = user?.serverData?.[0].host.split('.');
            const smtpConfig = {
                host: user?.serverData?.[0].host,
                ip: user?.serverData?.[0].ip,
                user: `admin@${parts.slice(1).join('.')}`,
            };
            return smtpConfig;
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch SMTP details', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('email-queue')),
    __param(1, (0, mongoose_1.InjectModel)(email_schemas_1.Email.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        mongoose_2.Model,
        mongoose_2.Model,
        firebase_service_1.FirebaseService])
], EmailService);
//# sourceMappingURL=email.service.js.map