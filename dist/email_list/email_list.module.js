"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailListModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const email_list_service_1 = require("./email_list.service");
const email_list_controller_1 = require("./email_list.controller");
const email_list_schemas_1 = require("./schemas/email_list.schemas");
const campaign_schemas_1 = require("../campaign/schemas/campaign.schemas");
let EmailListModule = class EmailListModule {
};
exports.EmailListModule = EmailListModule;
exports.EmailListModule = EmailListModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: email_list_schemas_1.EmailList.name, schema: email_list_schemas_1.EmailListSchema },
                { name: campaign_schemas_1.CampaignEmailTracking.name, schema: campaign_schemas_1.CampaignEmailTrackingSchema },
                { name: campaign_schemas_1.Campaign.name, schema: campaign_schemas_1.CampaignSchema },
            ]),
        ],
        controllers: [email_list_controller_1.EmailListController],
        providers: [email_list_service_1.EmailListService],
    })
], EmailListModule);
//# sourceMappingURL=email_list.module.js.map