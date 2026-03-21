import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignController {
    private readonly campaignService;
    constructor(campaignService: CampaignService);
    createCampaign(createCampaignDto: CreateCampaignDto, token: string): unknown;
    pauseCampaign(campaignId: string): unknown;
    resumeCampaign(createCampaignDto: CreateCampaignDto, token: string): unknown;
    getCampaignStats(campaignId: string): unknown;
    getAllCampaigns(): unknown;
    stopJob(jobId: string): unknown;
    cleanupCampaignData(campaignId: string): unknown;
    getCampaignCleanupStatus(campaignId: string): unknown;
    endCampaign(campaignId: string): unknown;
    getMailerHealth(selectedIp?: string): unknown;
    getMailerQueueStatus(selectedIp?: string): unknown;
    getLiveSendingStats(campaignId: string, selectedIp?: string, since?: string): unknown;
}
