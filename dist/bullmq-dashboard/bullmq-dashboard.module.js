"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullmqDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_dashboard_service_1 = require("./bullmq-dashboard.service");
const bullmq_1 = require("@nestjs/bullmq");
const auth_module_1 = require("../auth/auth.module");
let BullmqDashboardModule = class BullmqDashboardModule {
};
exports.BullmqDashboardModule = BullmqDashboardModule;
exports.BullmqDashboardModule = BullmqDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            bullmq_1.BullModule.registerQueue({
                name: 'email-queue',
            }),
        ],
        providers: [bullmq_dashboard_service_1.BullmqDashboardService],
    })
], BullmqDashboardModule);
//# sourceMappingURL=bullmq-dashboard.module.js.map