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
const mailer_1 = require("@nestjs-modules/mailer");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schemas_1 = require("./schemas/email.schemas");
let EmailService = class EmailService {
    constructor(mailService, emailModel) {
        this.mailService = mailService;
        this.emailModel = emailModel;
    }
    async create(createEmailDto) {
        try {
            await this.sendMail(createEmailDto);
            return {
                message: 'Emails processed and saved successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendMail(createEmailDto) {
        const { from, to: emailToUsers, templateType, mode, fromName, subject, } = createEmailDto;
        let { emailTemplate } = createEmailDto;
        emailTemplate = decodeURIComponent(emailTemplate);
        try {
            for (const userEmail of emailToUsers) {
                console.log(`Sending email to ${userEmail}`);
                const info = await this.mailService.sendMail({
                    from: `${fromName} <${from}>`,
                    to: userEmail,
                    subject: subject,
                    html: templateType === 'html' ? emailTemplate : emailTemplate,
                });
                console.log('🚀 ~ EmailService ~ sendMail ~ info:', info);
                const emailRecord = new this.emailModel({
                    from: createEmailDto.from,
                    to: userEmail,
                    offerId: createEmailDto.offerId,
                    campaignId: createEmailDto.campaignId,
                    response: info.response,
                    sentAt: new Date(),
                });
                await emailRecord.save();
            }
        }
        catch (e) {
            console.error(`Failed to send email to one or more recipients: ${e.message}`);
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(email_schemas_1.Email.name)),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        mongoose_2.Model])
], EmailService);
//# sourceMappingURL=email.service.js.map