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
var MailerProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let MailerProxyService = MailerProxyService_1 = class MailerProxyService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailerProxyService_1.name);
        this.mailerAuthToken =
            this.configService.get('MAILER_AUTH_TOKEN') || '';
        this.mailerBaseUrl = this.configService.get('MAILER_SERVICE_URL');
        this.httpClient = axios_1.default.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-Mailer-Token': this.mailerAuthToken,
            },
        });
        this.httpClient.interceptors.response.use((response) => response, (error) => {
            this.logger.error(`Mailer service error: ${error.message}`, error.response?.data);
            throw error;
        });
    }
    getMailerUrl(selectedIp) {
        if (this.mailerBaseUrl) {
            return this.mailerBaseUrl;
        }
        return null;
    }
    isMailerServiceEnabled() {
        return !!this.mailerBaseUrl && !!this.mailerAuthToken;
    }
    async startCampaign(createCampaignDto, smtpConfig) {
        const mailerUrl = this.getMailerUrl(createCampaignDto.selectedIp);
        if (!mailerUrl) {
            throw new common_1.HttpException('Mailer service URL not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        if (!this.mailerAuthToken) {
            throw new common_1.HttpException('Mailer authentication token not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();
            const ip = createCampaignDto.selectedIp?.split('-')[1]?.trim();
            const mailerSmtpConfig = {
                host: smtpConfig.host || `mail.${domain}`,
                user: smtpConfig.user || `admin@${domain}`,
                port: smtpConfig.port || 587,
            };
            const payload = {
                campaignId: createCampaignDto.campaignId,
                batchSize: createCampaignDto.batchSize,
                delay: createCampaignDto.delay,
                from: createCampaignDto.from,
                fromName: createCampaignDto.fromName,
                subject: createCampaignDto.subject,
                emailTemplate: createCampaignDto.emailTemplate,
                offerId: createCampaignDto.offerId,
                selectedIp: createCampaignDto.selectedIp,
                smtpConfig: mailerSmtpConfig,
            };
            this.logger.log(`Calling mailer service to start campaign: ${createCampaignDto.campaignId}`);
            const response = await this.httpClient.post(`${mailerUrl}/mail/campaign/start`, payload);
            return {
                message: response.data.message || 'Campaign started on mailer service',
                success: response.data.success || true,
                mailerId: response.data.mailerId,
            };
        }
        catch (error) {
            this.logger.error(`Failed to start campaign on mailer service: ${error.message}`, error.response?.data);
            if (error.response) {
                throw new common_1.HttpException(error.response.data?.message || 'Mailer service error', error.response.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException(`Failed to connect to mailer service: ${error.message}`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async getMailerHealth(selectedIp) {
        const mailerUrl = this.getMailerUrl(selectedIp);
        if (!mailerUrl) {
            return null;
        }
        try {
            const response = await this.httpClient.get(`${mailerUrl}/mail/health`);
            return response.data;
        }
        catch (error) {
            this.logger.warn(`Failed to get mailer health: ${error.message}`);
            return null;
        }
    }
    async getMailerQueueStatus(selectedIp) {
        const mailerUrl = this.getMailerUrl(selectedIp);
        if (!mailerUrl) {
            return null;
        }
        try {
            const response = await this.httpClient.get(`${mailerUrl}/mail/queue`);
            return response.data;
        }
        catch (error) {
            this.logger.warn(`Failed to get mailer queue status: ${error.message}`);
            return null;
        }
    }
    async sendTestEmails(createCampaignDto, smtpConfig) {
        const mailerUrl = this.getMailerUrl(createCampaignDto.selectedIp);
        if (!mailerUrl) {
            throw new common_1.HttpException('Mailer service URL not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        if (!this.mailerAuthToken) {
            throw new common_1.HttpException('Mailer authentication token not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();
            const mailerSmtpConfig = {
                host: smtpConfig.host || `mail.${domain}`,
                user: smtpConfig.user || `admin@${domain}`,
                port: smtpConfig.port || 587,
            };
            const payload = {
                from: createCampaignDto.from,
                fromName: createCampaignDto.fromName,
                subject: createCampaignDto.subject,
                emailTemplate: createCampaignDto.emailTemplate,
                offerId: createCampaignDto.offerId,
                campaignId: createCampaignDto.campaignId,
                to: createCampaignDto.to,
                selectedIp: createCampaignDto.selectedIp,
                smtpConfig: mailerSmtpConfig,
            };
            this.logger.log(`Calling mailer service to send test emails for campaign: ${createCampaignDto.campaignId}`);
            const response = await this.httpClient.post(`${mailerUrl}/mail/test`, payload);
            return {
                message: response.data.message || 'Test emails sent',
                success: response.data.success || false,
                sent: response.data.sent || [],
                failed: response.data.failed || [],
                emailSent: response.data.emailSent || 0,
                emailFailed: response.data.emailFailed || 0,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send test emails on mailer service: ${error.message}`, error.response?.data);
            if (error.response) {
                throw new common_1.HttpException(error.response.data?.message || 'Mailer service error', error.response.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException(`Failed to connect to mailer service: ${error.message}`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
exports.MailerProxyService = MailerProxyService;
exports.MailerProxyService = MailerProxyService = MailerProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerProxyService);
//# sourceMappingURL=mailer-proxy.service.js.map