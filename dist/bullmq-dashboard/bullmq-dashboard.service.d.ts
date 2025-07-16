import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NestExpressApplication } from '@nestjs/platform-express';
export declare class BullmqDashboardService implements OnModuleInit {
    private emailQueue;
    private campaignQueue;
    private serverAdapter;
    constructor(emailQueue: Queue, campaignQueue: Queue);
    onModuleInit(): void;
    getDashboardRouter(): any;
    bindMiddleware(app: NestExpressApplication): void;
}
