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
exports.ServersDomainController = void 0;
const common_1 = require("@nestjs/common");
const servers_domains_service_1 = require("./servers-domains.service");
const create_server_domain_dto_1 = require("./dto/create-server-domain.dto");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const admin_auth_guard_1 = require("../auth/admin-auth.guard");
let ServersDomainController = class ServersDomainController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    getSelectableIps() {
        return this.service.getSelectableIps();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
    addIp(id, ipDto) {
        return this.service.addIp(id, ipDto);
    }
    updateIp(id, ip, updates) {
        return this.service.updateIp(id, ip, updates);
    }
    removeIp(id, ip) {
        return this.service.removeIp(id, ip);
    }
    markSpam(id, ip, wentSpam) {
        return this.service.markIpSpam(id, ip, wentSpam);
    }
};
exports.ServersDomainController = ServersDomainController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_server_domain_dto_1.CreateServerDomainDto]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('selectable-ips'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "getSelectableIps", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/ips'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_server_domain_dto_1.IpEntryDto]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "addIp", null);
__decorate([
    (0, common_1.Put)(':id/ips/:ip'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('ip')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "updateIp", null);
__decorate([
    (0, common_1.Delete)(':id/ips/:ip'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('ip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "removeIp", null);
__decorate([
    (0, common_1.Patch)(':id/ips/:ip/spam'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('ip')),
    __param(2, (0, common_1.Body)('wentSpam')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", void 0)
], ServersDomainController.prototype, "markSpam", null);
exports.ServersDomainController = ServersDomainController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Controller)('/api/servers-domains'),
    __metadata("design:paramtypes", [servers_domains_service_1.ServersDomainService])
], ServersDomainController);
//# sourceMappingURL=servers-domains.controller.js.map