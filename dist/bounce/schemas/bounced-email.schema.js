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
exports.BouncedEmailSchema = exports.BouncedEmail = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let BouncedEmail = class BouncedEmail {
};
exports.BouncedEmail = BouncedEmail;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], BouncedEmail.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BouncedEmail.prototype, "domain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['hard', 'soft'] }),
    __metadata("design:type", String)
], BouncedEmail.prototype, "bounceType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BouncedEmail.prototype, "statusCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BouncedEmail.prototype, "diagnosticMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], BouncedEmail.prototype, "bouncedAt", void 0);
exports.BouncedEmail = BouncedEmail = __decorate([
    (0, mongoose_1.Schema)({ collection: 'bounced_emails', timestamps: true })
], BouncedEmail);
exports.BouncedEmailSchema = mongoose_1.SchemaFactory.createForClass(BouncedEmail);
exports.BouncedEmailSchema.index({ email: 1, domain: 1 });
//# sourceMappingURL=bounced-email.schema.js.map