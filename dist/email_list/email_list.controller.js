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
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const admin_auth_guard_1 = require("../auth/admin-auth.guard");
const fs = require("fs");
const path = require("path");
let EmailListController = class EmailListController {
    constructor(emailListService) {
        this.emailListService = emailListService;
    }
    async addEmails(emails) {
        if (!Array.isArray(emails) || !emails.length) {
            throw new common_1.BadRequestException('Emails must be a non-empty array');
        }
        return await this.emailListService.addEmails(emails);
    }
    async uploadCSV(file) {
        console.log('🚀 ~ EmailListController ~ uploadCSV ~ file:', file);
        if (!file) {
            throw new common_1.BadRequestException('CSV file must be provided.');
        }
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        try {
            await this.emailListService.addEmailsFromCSVFile(filePath);
            fs.unlinkSync(filePath);
            return {
                message: 'Emails added successfully from CSV.',
                success: true,
            };
        }
        catch (error) {
            console.log('🚀 ~ EmailListController ~ uploadCSV ~ error.message:', error.message);
            fs.unlinkSync(filePath);
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.EmailListController = EmailListController;
__decorate([
    (0, common_1.Post)('add-emails'),
    __param(0, (0, common_1.Body)('emails')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailListController.prototype, "uploadCSV", null);
exports.EmailListController = EmailListController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Controller)('/api/email_list'),
    __metadata("design:paramtypes", [email_list_service_1.EmailListService])
], EmailListController);
//# sourceMappingURL=email_list.controller.js.map