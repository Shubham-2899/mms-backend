import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { CampaignDocument, CampaignEmailTrackingDocument } from './schemas/campaign.schemas';
import { EmailDocument } from 'src/email/schemas/email.schemas';
export declare class CampaignProcessor extends WorkerHost {
    private emailTrackingModel;
    private campaignModel;
    private emailModel;
    constructor(emailTrackingModel: Model<CampaignEmailTrackingDocument>, campaignModel: Model<CampaignDocument>, emailModel: Model<EmailDocument>);
    process(job: Job<any>): any;
    private cleanupCampaignData;
}
