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
let EmailService = class EmailService {
    constructor(emailQueue, emailModel) {
        this.emailQueue = emailQueue;
        this.emailModel = emailModel;
    }
    async create(createEmailDto) {
        try {
            const smtpConfig = {
                host: 'mail.elitemarketpro.site',
                user: 'admin@elitemarketpro.site',
                password: 'adminMms@2899',
            };
            await this.emailQueue.add('send-email-job', {
                ...createEmailDto,
                smtpConfig,
            });
            return { message: 'Email job added to queue successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('email-queue')),
    __param(1, (0, mongoose_1.InjectModel)(email_schemas_1.Email.name)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        mongoose_2.Model])
], EmailService);
//# sourceMappingURL=email.service.js.map