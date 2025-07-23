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
exports.CampaignController = void 0;
const common_1 = require("@nestjs/common");
const campaign_service_1 = require("./campaign.service");
const create_campaign_dto_1 = require("./dto/create-campaign.dto");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
let CampaignController = class CampaignController {
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async createCampaign(createCampaignDto, token) {
        const firebaseToken = token.split(' ')[1];
        return this.campaignService.createCampaign(createCampaignDto, firebaseToken);
    }
    async pauseCampaign(campaignId) {
        return this.campaignService.pauseCampaign(campaignId);
    }
    async resumeCampaign(createCampaignDto, token) {
        const firebaseToken = token.split(' ')[1];
        return this.campaignService.resumeCampaignWithToken(createCampaignDto, firebaseToken);
    }
    async getCampaignStats(campaignId) {
        return this.campaignService.getCampaignStats(campaignId);
    }
    async getAllCampaigns() {
        return this.campaignService.getAllCampaigns();
    }
    async stopJob(jobId) {
        return this.campaignService.stopJob(jobId);
    }
    async cleanupCampaignData(campaignId) {
        return this.campaignService.cleanupCampaignData(campaignId);
    }
    async getCampaignCleanupStatus(campaignId) {
        return this.campaignService.getCampaignCleanupStatus(campaignId);
    }
    async endCampaign(campaignId) {
        return this.campaignService.endCampaign(campaignId);
    }
};
exports.CampaignController = CampaignController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('Authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_campaign_dto_1.CreateCampaignDto, String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Put)(':campaignId/pause'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "pauseCampaign", null);
__decorate([
    (0, common_1.Put)(':campaignId/resume'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('Authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_campaign_dto_1.CreateCampaignDto, String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "resumeCampaign", null);
__decorate([
    (0, common_1.Get)('stats/:campaignId'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "getCampaignStats", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "getAllCampaigns", null);
__decorate([
    (0, common_1.Post)('stopjob'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "stopJob", null);
__decorate([
    (0, common_1.Post)(':campaignId/cleanup'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "cleanupCampaignData", null);
__decorate([
    (0, common_1.Get)(':campaignId/cleanup-status'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "getCampaignCleanupStatus", null);
__decorate([
    (0, common_1.Put)(':campaignId/end'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "endCampaign", null);
exports.CampaignController = CampaignController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('/api/campaign'),
    __metadata("design:paramtypes", [campaign_service_1.CampaignService])
], CampaignController);
//# sourceMappingURL=campaign.controller.js.map