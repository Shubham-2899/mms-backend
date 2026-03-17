import { ConfigService } from '@nestjs/config';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class MailerProxyService {
    private configService;
    private readonly logger;
    private readonly httpClient;
    private readonly mailerAuthToken;
    private readonly mailerBaseUrl;
    constructor(configService: ConfigService);
    private getMailerUrl;
    isMailerServiceEnabled(): boolean;
    startCampaign(createCampaignDto: CreateCampaignDto, smtpConfig: any): Promise<{
        message: string;
        success: boolean;
        mailerId?: string;
    }>;
    getMailerHealth(selectedIp?: string): Promise<any>;
    getMailerQueueStatus(selectedIp?: string): Promise<any>;
    sendTestEmails(createCampaignDto: CreateCampaignDto, smtpConfig: any): Promise<{
        message: string;
        success: boolean;
        sent: string[];
        failed: string[];
        emailSent: number;
        emailFailed: number;
    }>;
}
