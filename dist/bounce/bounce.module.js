"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BounceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bounced_email_schema_1 = require("./schemas/bounced-email.schema");
const bounce_poller_service_1 = require("./bounce-poller.service");
const bounce_controller_1 = require("./bounce.controller");
const server_domain_schema_1 = require("../servers-domains/schemas/server-domain.schema");
let BounceModule = class BounceModule {
};
exports.BounceModule = BounceModule;
exports.BounceModule = BounceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: bounced_email_schema_1.BouncedEmail.name, schema: bounced_email_schema_1.BouncedEmailSchema },
                { name: server_domain_schema_1.ServerDomain.name, schema: server_domain_schema_1.ServerDomainSchema },
            ]),
        ],
        controllers: [bounce_controller_1.BounceController],
        providers: [bounce_poller_service_1.BouncePollerService],
        exports: [bounce_poller_service_1.BouncePollerService],
    })
], BounceModule);
//# sourceMappingURL=bounce.module.js.map