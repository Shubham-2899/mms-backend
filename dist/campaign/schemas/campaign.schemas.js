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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignEmailTrackingSchema = exports.CampaignSchema = exports.CampaignEmailTracking = exports.Campaign = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Campaign = class Campaign {
};
exports.Campaign = Campaign;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Campaign.prototype, "campaignId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['draft', 'ready', 'running', 'paused', 'completed', 'ended'], default: 'draft' }),
    __metadata("design:type", String)
], Campaign.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "fromName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "templateType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "emailTemplate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "offerId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "selectedIp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Campaign.prototype, "batchSize", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Campaign.prototype, "delay", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Campaign.prototype, "jobId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Campaign.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Campaign.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Campaign.prototype, "pendingEmails", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Campaign.prototype, "totalEmails", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Campaign.prototype, "sentEmails", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Campaign.prototype, "failedEmails", void 0);
exports.Campaign = Campaign = __decorate([
    (0, mongoose_1.Schema)({ collection: 'campaigns', timestamps: true })
], Campaign);
let CampaignEmailTracking = class CampaignEmailTracking {
};
exports.CampaignEmailTracking = CampaignEmailTracking;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    }),
    __metadata("design:type", String)
], CampaignEmailTracking.prototype, "to_email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CampaignEmailTracking.prototype, "campaignId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'pending' }),
    __metadata("design:type", String)
], CampaignEmailTracking.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CampaignEmailTracking.prototype, "isProcessed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], CampaignEmailTracking.prototype, "sentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CampaignEmailTracking.prototype, "errorMessage", void 0);
exports.CampaignEmailTracking = CampaignEmailTracking = __decorate([
    (0, mongoose_1.Schema)({ collection: 'campaign_email_tracking', timestamps: true })
], CampaignEmailTracking);
exports.CampaignSchema = mongoose_1.SchemaFactory.createForClass(Campaign);
exports.CampaignEmailTrackingSchema = mongoose_1.SchemaFactory.createForClass(CampaignEmailTracking);
//# sourceMappingURL=campaign.schemas.js.map