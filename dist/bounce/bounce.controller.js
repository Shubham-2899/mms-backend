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
exports.BounceController = void 0;
const common_1 = require("@nestjs/common");
const bounce_poller_service_1 = require("./bounce-poller.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bounced_email_schema_1 = require("./schemas/bounced-email.schema");
let BounceController = class BounceController {
    constructor(bouncePollerService, bouncedEmailModel) {
        this.bouncePollerService = bouncePollerService;
        this.bouncedEmailModel = bouncedEmailModel;
    }
    async list(domain, bounceType, page = '1', limit = '50') {
        const filter = {};
        if (domain)
            filter.domain = domain;
        if (bounceType)
            filter.bounceType = bounceType;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(200, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
            this.bouncedEmailModel
                .find(filter)
                .sort({ bouncedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            this.bouncedEmailModel.countDocuments(filter),
        ]);
        return { success: true, data, total, page: pageNum, limit: limitNum };
    }
    async pollDomain(domain) {
        try {
            const result = await this.bouncePollerService.pollDomain(domain);
            return { success: true, ...result };
        }
        catch (err) {
            return {
                success: false,
                message: err.message,
                stack: err.stack,
                hint: 'Check that the bounces@<domain> mailbox exists and BOUNCE_IMAP_PORT/BOUNCE_IMAP_SECURE env vars are correct',
            };
        }
    }
    async pollAll() {
        await this.bouncePollerService.pollAllDomains();
        return {
            success: true,
            message: 'Bounce poll triggered for all active domains',
        };
    }
    async checkEmails(body) {
        if (!Array.isArray(body.emails) || !body.emails.length) {
            return { success: false, message: 'emails array is required' };
        }
        const hardBounced = await this.bouncePollerService.filterHardBounces(body.emails);
        return {
            success: true,
            hardBounced: Array.from(hardBounced),
            count: hardBounced.size,
        };
    }
    async remove(email) {
        const result = await this.bouncedEmailModel.deleteMany({
            email: email.toLowerCase(),
        });
        return { success: true, deletedCount: result.deletedCount };
    }
};
exports.BounceController = BounceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('domain')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], BounceController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('poll/:domain'),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BounceController.prototype, "pollDomain", null);
__decorate([
    (0, common_1.Post)('poll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BounceController.prototype, "pollAll", null);
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BounceController.prototype, "checkEmails", null);
__decorate([
    (0, common_1.Delete)(':email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BounceController.prototype, "remove", null);
exports.BounceController = BounceController = __decorate([
    (0, common_1.Controller)('/api/bounces'),
    __param(1, (0, mongoose_1.InjectModel)(bounced_email_schema_1.BouncedEmail.name)),
    __metadata("design:paramtypes", [bounce_poller_service_1.BouncePollerService,
        mongoose_2.Model])
], BounceController);
//# sourceMappingURL=bounce.controller.js.map