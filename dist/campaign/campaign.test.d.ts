import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare const testCampaignData: CreateCampaignDto;
export declare const bulkCampaignData: CreateCampaignDto;
export declare const apiExamples: {
    createTestCampaign: string;
    createBulkCampaign: string;
    pauseCampaign: string;
    resumeCampaign: string;
    getCampaignStats: string;
    getAllCampaigns: string;
    stopJob: string;
};
export declare const expectedResponses: {
    testModeResponse: {
        message: string;
        success: boolean;
        sent: string[];
        failed: any[];
        emailSent: number;
        emailFailed: number;
    };
    bulkModeResponse: {
        message: string;
        success: boolean;
        jobId: string;
    };
    campaignStatsResponse: {
        campaignId: string;
        status: string;
        counts: {
            sent: number;
            failed: number;
            pending: number;
            total: number;
        };
        campaign: {
            from: string;
            fromName: string;
            subject: string;
            offerId: string;
            selectedIp: string;
            batchSize: number;
            delay: number;
            startedAt: string;
            completedAt: any;
        };
    };
};
export declare const databaseExamples: {
    insertTestEmails: string;
    queryCampaignStats: string;
};
