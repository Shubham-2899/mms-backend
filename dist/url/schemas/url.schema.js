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
exports.UrlSchema = exports.Url = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Url = class Url {
};
exports.Url = Url;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Url.prototype, "shortId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Url.prototype, "redirectURL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Url.prototype, "offerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Url.prototype, "domain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Url.prototype, "linkType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Url.prototype, "campaignId", void 0);
__decorate([
    (0, mongoose_1.Prop)((0, mongoose_1.raw)([
        {
            timestamp: { type: Number },
            ipAddress: { type: String },
            userAgent: { type: String },
        },
    ])),
    __metadata("design:type", Array)
], Url.prototype, "visitHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Url.prototype, "clickCount", void 0);
exports.Url = Url = __decorate([
    (0, mongoose_1.Schema)()
], Url);
exports.UrlSchema = mongoose_1.SchemaFactory.createForClass(Url);
//# sourceMappingURL=url.schema.js.map