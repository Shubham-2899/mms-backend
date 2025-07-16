"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const campaign_controller_1 = require("./campaign.controller");
const campaign_service_1 = require("./campaign.service");
const campaign_processor_1 = require("./campaign.processor");
const campaign_schemas_1 = require("./schemas/campaign.schemas");
const email_schemas_1 = require("../email/schemas/email.schemas");
const user_schema_1 = require("../user/schemas/user.schema");
const auth_module_1 = require("../auth/auth.module");
const email_processor_1 = require("../email/email.processor");
let CampaignModule = class CampaignModule {
};
exports.CampaignModule = CampaignModule;
exports.CampaignModule = CampaignModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: campaign_schemas_1.Campaign.name, schema: campaign_schemas_1.CampaignSchema },
                { name: campaign_schemas_1.CampaignEmailTracking.name, schema: campaign_schemas_1.CampaignEmailTrackingSchema },
                { name: email_schemas_1.Email.name, schema: email_schemas_1.EmailSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            bullmq_1.BullModule.registerQueue({
                name: 'campaign-queue',
            }, {
                name: 'email-queue',
            }),
            auth_module_1.AuthModule,
        ],
        controllers: [campaign_controller_1.CampaignController],
        providers: [campaign_service_1.CampaignService, campaign_processor_1.CampaignProcessor, email_processor_1.EmailProcessor],
        exports: [campaign_service_1.CampaignService],
    })
], CampaignModule);
//# sourceMappingURL=campaign.module.js.map