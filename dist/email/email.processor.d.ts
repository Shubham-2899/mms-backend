import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { EmailDocument } from './schemas/email.schemas';
export declare class EmailProcessor extends WorkerHost {
    private emailModel;
    constructor(emailModel: Model<EmailDocument>);
    process(job: Job<any>): any;
}
