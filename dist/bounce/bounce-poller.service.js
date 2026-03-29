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
var BouncePollerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BouncePollerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const bounced_email_schema_1 = require("./schemas/bounced-email.schema");
const server_domain_schema_1 = require("../servers-domains/schemas/server-domain.schema");
let BouncePollerService = BouncePollerService_1 = class BouncePollerService {
    constructor(bouncedEmailModel, serverDomainModel) {
        this.bouncedEmailModel = bouncedEmailModel;
        this.serverDomainModel = serverDomainModel;
        this.logger = new common_1.Logger(BouncePollerService_1.name);
        this.HARD_BOUNCE_PATTERN = /\b5\.\d+\.\d+\b/;
        this.SOFT_BOUNCE_PATTERN = /\b4\.\d+\.\d+\b/;
    }
    async pollAllDomains() {
        const domains = await this.serverDomainModel
            .find({ status: 'active' })
            .select('domain')
            .lean();
        if (!domains.length)
            return;
        this.logger.log(`Starting bounce poll for ${domains.length} domain(s)`);
        for (const { domain } of domains) {
            try {
                await this.pollDomain(domain);
            }
            catch (err) {
                this.logger.error(`Failed to poll bounces for ${domain}: ${err.message}`);
            }
        }
        this.logger.log('Bounce poll complete');
    }
    async pollDomain(domain) {
        const host = `mail.${domain}`;
        const user = `bounces@${domain}`;
        const password = process.env.ROOT_MAIL_USER_PASSWORD || '';
        if (!password) {
            this.logger.warn(`ROOT_MAIL_USER_PASSWORD not set, skipping bounce poll for ${domain}`);
            return { processed: 0, errors: 0 };
        }
        const imapPort = parseInt(process.env.BOUNCE_IMAP_PORT || '993', 10);
        const imapSecure = process.env.BOUNCE_IMAP_SECURE !== 'false';
        this.logger.log(`Connecting to ${host}:${imapPort} (secure=${imapSecure}) as ${user}`);
        const client = new imapflow_1.ImapFlow({
            host,
            port: imapPort,
            secure: imapSecure,
            auth: { user, pass: password },
            logger: {
                debug: () => { },
                info: (obj) => this.logger.debug(JSON.stringify(obj)),
                warn: (obj) => this.logger.warn(JSON.stringify(obj)),
                error: (obj) => this.logger.error(JSON.stringify(obj)),
            },
            tls: {
                rejectUnauthorized: false,
                checkServerIdentity: () => undefined,
            },
        });
        client.on('error', (err) => {
            this.logger.error(`IMAP connection error for ${domain}: ${err.message}`);
        });
        let processed = 0;
        let errors = 0;
        let connectionError = null;
        try {
            await client.connect();
            this.logger.log(`IMAP connected to ${host} for ${domain}`);
            const lock = await client.getMailboxLock('INBOX');
            try {
                const messages = [];
                for await (const msg of client.fetch({ seen: false }, { source: true, uid: true })) {
                    messages.push({ uid: msg.uid, source: msg.source });
                }
                if (!messages.length) {
                    this.logger.debug(`No new bounces for ${domain}`);
                    return { processed: 0, errors: 0 };
                }
                this.logger.log(`Processing ${messages.length} bounce(s) for ${domain}`);
                for (const msg of messages) {
                    try {
                        await this.processNdr(msg.source, domain);
                        await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen'], {
                            uid: true,
                        });
                        processed++;
                    }
                    catch (err) {
                        this.logger.warn(`Failed to process NDR for ${domain}: ${err.message}`);
                        errors++;
                    }
                }
            }
            finally {
                lock.release();
            }
        }
        catch (err) {
            connectionError = err;
            this.logger.error(`IMAP session error for ${domain}: ${err.message}`);
        }
        finally {
            try {
                await client.logout();
            }
            catch (_) { }
        }
        if (connectionError)
            throw connectionError;
        return { processed, errors };
    }
    async processNdr(source, domain) {
        const parsed = await (0, mailparser_1.simpleParser)(source);
        const failedEmail = this.extractFailedEmail(parsed);
        if (!failedEmail) {
            this.logger.debug('Could not extract failed email from NDR, skipping');
            return;
        }
        const { statusCode, bounceType, diagnosticMessage } = this.extractBounceInfo(parsed);
        await this.bouncedEmailModel.findOneAndUpdate({ email: failedEmail, domain }, {
            email: failedEmail,
            domain,
            bounceType,
            statusCode,
            diagnosticMessage,
            bouncedAt: parsed.date ?? new Date(),
        }, { upsert: true, new: true });
        this.logger.debug(`Recorded ${bounceType} bounce for ${failedEmail} on ${domain}`);
    }
    extractFailedEmail(parsed) {
        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
        const finalRecipient = parsed.headers?.get('final-recipient');
        if (finalRecipient) {
            const match = finalRecipient.match(emailRegex);
            if (match)
                return match[0].toLowerCase();
        }
        const originalRecipient = parsed.headers?.get('original-recipient');
        if (originalRecipient) {
            const match = originalRecipient.match(emailRegex);
            if (match)
                return match[0].toLowerCase();
        }
        const text = parsed.text || '';
        const patterns = [
            /failed.*?:\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
            /undeliverable.*?to\s+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
            /delivery.*?failed.*?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match)
                return match[1].toLowerCase();
        }
        const allEmails = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
        const candidate = allEmails.find((e) => !e.startsWith('bounces@') && !e.startsWith('mailer-daemon@'));
        return candidate ? candidate.toLowerCase() : null;
    }
    extractBounceInfo(parsed) {
        const text = parsed.text || '';
        const subject = parsed.subject || '';
        const combined = `${subject} ${text}`;
        const dsnMatch = combined.match(/\b([45]\.\d+\.\d+)\b/);
        const statusCode = dsnMatch ? dsnMatch[1] : '';
        let bounceType = 'soft';
        if (statusCode.startsWith('5') || this.HARD_BOUNCE_PATTERN.test(combined)) {
            bounceType = 'hard';
        }
        else if (statusCode.startsWith('4') ||
            this.SOFT_BOUNCE_PATTERN.test(combined)) {
            bounceType = 'soft';
        }
        else {
            const hardKeywords = /user unknown|no such user|does not exist|invalid address|mailbox not found/i;
            if (hardKeywords.test(combined))
                bounceType = 'hard';
        }
        const diagnosticMessage = text.split('\n').find((line) => line.trim().length > 20) || '';
        return {
            statusCode,
            bounceType,
            diagnosticMessage: diagnosticMessage.trim().slice(0, 500),
        };
    }
    async isHardBounce(email) {
        const record = await this.bouncedEmailModel.findOne({
            email: email.toLowerCase(),
            bounceType: 'hard',
        });
        return !!record;
    }
    async filterHardBounces(emails) {
        const normalised = emails.map((e) => e.toLowerCase());
        const records = await this.bouncedEmailModel
            .find({ email: { $in: normalised }, bounceType: 'hard' })
            .select('email')
            .lean();
        return new Set(records.map((r) => r.email));
    }
};
exports.BouncePollerService = BouncePollerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BouncePollerService.prototype, "pollAllDomains", null);
exports.BouncePollerService = BouncePollerService = BouncePollerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bounced_email_schema_1.BouncedEmail.name)),
    __param(1, (0, mongoose_1.InjectModel)(server_domain_schema_1.ServerDomain.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], BouncePollerService);
//# sourceMappingURL=bounce-poller.service.js.map