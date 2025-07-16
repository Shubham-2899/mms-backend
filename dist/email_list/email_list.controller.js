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
exports.EmailListController = void 0;
const common_1 = require("@nestjs/common");
const email_list_service_1 = require("./email_list.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
let EmailListController = class EmailListController {
    constructor(emailListService) {
        this.emailListService = emailListService;
    }
    async addEmails(body) {
        const { emails, campaignId } = body;
        if (!Array.isArray(emails) || !emails.length) {
            throw new common_1.BadRequestException('Emails must be a non-empty array');
        }
        if (!campaignId) {
            throw new common_1.BadRequestException('Campaign ID is required');
        }
        return await this.emailListService.addEmails(emails, campaignId);
    }
    async uploadCSV(file, campaignId) {
        console.log('🚀 ~ EmailListController ~ uploadCSV ~ file:', file);
        console.log('🚀 ~ EmailListController ~ uploadCSV ~ campaignId:', campaignId);
        if (!file) {
            throw new common_1.BadRequestException('CSV file must be provided.');
        }
        if (!campaignId) {
            throw new common_1.BadRequestException('Campaign ID is required.');
        }
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        try {
            const res = await this.emailListService.addEmailsFromCSVFile(filePath, campaignId);
            fs.unlinkSync(filePath);
            return res;
        }
        catch (error) {
            console.log('🚀 ~ EmailListController ~ uploadCSV ~ error.message:', error.message);
            fs.unlinkSync(filePath);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getSuppressionList(page, limit, fromDate, toDate) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const result = await this.emailListService.getSuppressionList(pageNum, limitNum, fromDate, toDate);
        return {
            message: 'Suppression list fetched successfully.',
            success: true,
            ...result,
        };
    }
};
exports.EmailListController = EmailListController;
__decorate([
    (0, common_1.Post)('add-emails'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailListController.prototype, "addEmails", null);
__decorate([
    (0, common_1.Post)('upload-emails'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (_req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${file.originalname}`;
                cb(null, uniqueSuffix);
            },
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.includes('csv')) {
                return cb(new common_1.BadRequestException('Only CSV files are allowed!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmailListController.prototype, "uploadCSV", null);
__decorate([
    (0, common_1.Get)('/suppressions'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmailListController.prototype, "getSuppressionList", null);
exports.EmailListController = EmailListController = __decorate([
    (0, common_1.Controller)('/api/email_list'),
    __metadata("design:paramtypes", [email_list_service_1.EmailListService])
], EmailListController);
//# sourceMappingURL=email_list.controller.js.map