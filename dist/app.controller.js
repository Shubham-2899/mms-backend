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
exports.AppController = void 0;
const app_service_1 = require("./app.service");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async getRedirectUrl(response, ip, headers, shortId) {
        try {
            return response.redirect(await this.appService.getRedirectUrl(shortId, headers, ip));
        }
        catch (e) {
            console.log(e);
        }
    }
    getHomePage() {
        const htmlFilePath = (0, path_1.join)(__dirname, '..', 'public', 'index.html');
        const htmlContent = (0, fs_1.readFileSync)(htmlFilePath, 'utf8');
        return htmlContent;
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(':shortId/*/*'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Param)('shortId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRedirectUrl", null);
__decorate([
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHomePage", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('/'),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map