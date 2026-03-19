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
exports.ServerDomainSchema = exports.ServerDomain = exports.IpEntrySchema = exports.IpEntry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let IpEntry = class IpEntry {
};
exports.IpEntry = IpEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IpEntry.prototype, "ip", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], IpEntry.prototype, "isMainIp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], IpEntry.prototype, "wentSpam", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IpEntry.prototype, "provider", void 0);
exports.IpEntry = IpEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], IpEntry);
exports.IpEntrySchema = mongoose_1.SchemaFactory.createForClass(IpEntry);
let ServerDomain = class ServerDomain {
};
exports.ServerDomain = ServerDomain;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], ServerDomain.prototype, "domain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.IpEntrySchema], required: true, default: [] }),
    __metadata("design:type", Array)
], ServerDomain.prototype, "availableIps", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['active', 'inactive'], default: 'active' }),
    __metadata("design:type", String)
], ServerDomain.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ServerDomain.prototype, "notes", void 0);
exports.ServerDomain = ServerDomain = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ServerDomain);
exports.ServerDomainSchema = mongoose_1.SchemaFactory.createForClass(ServerDomain);
//# sourceMappingURL=server-domain.schema.js.map