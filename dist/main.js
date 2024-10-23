"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const bullmq_dashboard_service_1 = require("./bullmq-dashboard/bullmq-dashboard.service");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ limit: '5mb', extended: true }));
    const bullmqDashboardService = app.get(bullmq_dashboard_service_1.BullmqDashboardService);
    bullmqDashboardService.bindMiddleware(app);
    await app.listen(5000);
}
bootstrap();
//# sourceMappingURL=main.js.map