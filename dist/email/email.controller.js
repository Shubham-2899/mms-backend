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
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const create_email_dto_1 = require("./dto/create-email.dto");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async create(createEmailDto, token) {
        const firebaseToken = token.split(' ')[1];
        return this.emailService.create(createEmailDto, firebaseToken);
    }
    async getAvailableIps(token) {
        const firebaseToken = token.split(' ')[1];
        return this.emailService.getAvailableIps(firebaseToken);
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('sendemail'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('Authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_email_dto_1.CreateEmailDto, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('/availableIps'),
    __param(0, (0, common_1.Headers)('Authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getAvailableIps", null);
exports.EmailController = EmailController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('/api'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map