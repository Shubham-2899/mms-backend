import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class MailerProxyService {
  private readonly logger = new Logger(MailerProxyService.name);
  private readonly httpClient: AxiosInstance;
  private readonly mailerAuthToken: string;
  private readonly mailerBaseUrl: string | null;

  constructor(private configService: ConfigService) {
    this.mailerAuthToken =
      this.configService.get<string>('MAILER_AUTH_TOKEN') || '';
    this.mailerBaseUrl = this.configService.get<string>('MAILER_SERVICE_URL');

    // Create axios instance with default config
    this.httpClient = axios.create({
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'X-Mailer-Token': this.mailerAuthToken,
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `Mailer service error: ${error.message}`,
          error.response?.data,
        );
        throw error;
      },
    );
  }

  /**
   * Get mailer service URL based on selectedIp
   * This can be extended to support multiple mailer services
   */
  private getMailerUrl(selectedIp?: string): string | null {
    // If MAILER_SERVICE_URL is set, use it (single mailer service)
    if (this.mailerBaseUrl) {
      return this.mailerBaseUrl;
    }

    // Future: Can implement logic to map selectedIp to specific mailer URLs
    // For now, return null to fallback to BullMQ
    return null;
  }

  /**
   * Check if mailer service is enabled and available
   * Requires MAILER_PROXY_ENABLED=true in addition to URL and token being set
   */
  isMailerServiceEnabled(): boolean {
    const proxyEnabled =
      this.configService.get<string>('MAILER_PROXY_ENABLED') === 'true';
    return proxyEnabled && !!this.mailerBaseUrl && !!this.mailerAuthToken;
  }

  /**
   * Start or resume a campaign on the mailer service
   */
  async startCampaign(
    createCampaignDto: CreateCampaignDto,
    smtpConfig: any,
  ): Promise<{ message: string; success: boolean; mailerId?: string }> {
    const mailerUrl = this.getMailerUrl(createCampaignDto.selectedIp);

    if (!mailerUrl) {
      throw new HttpException(
        'Mailer service URL not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!this.mailerAuthToken) {
      throw new HttpException(
        'Mailer authentication token not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Extract domain and IP from selectedIp
      const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();
      const ip = createCampaignDto.selectedIp?.split('-')[1]?.trim();

      // Build SMTP config for mailer service
      const mailerSmtpConfig = {
        host: smtpConfig.host || `mail.${domain}`,
        user: smtpConfig.user || `admin@${domain}`,
        port: smtpConfig.port || 587,
      };

      // Prepare request payload
      const payload = {
        campaignId: createCampaignDto.campaignId,
        batchSize: createCampaignDto.batchSize,
        delay: createCampaignDto.delay,
        from: createCampaignDto.from,
        fromName: createCampaignDto.fromName,
        subject: createCampaignDto.subject,
        emailTemplate: createCampaignDto.emailTemplate,
        offerId: createCampaignDto.offerId,
        selectedIp: createCampaignDto.selectedIp,
        smtpConfig: mailerSmtpConfig,
      };

      this.logger.log(
        `Calling mailer service to start campaign: ${createCampaignDto.campaignId}`,
      );

      const response = await this.httpClient.post(
        `${mailerUrl}/mail/campaign/start`,
        payload,
      );

      return {
        message: response.data.message || 'Campaign started on mailer service',
        success: response.data.success || true,
        mailerId: response.data.mailerId,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to start campaign on mailer service: ${error.message}`,
        error.response?.data,
      );

      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Mailer service error',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        `Failed to connect to mailer service: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get mailer service health status
   */
  async getMailerHealth(selectedIp?: string): Promise<any> {
    const mailerUrl = this.getMailerUrl(selectedIp);

    if (!mailerUrl) {
      return null;
    }

    try {
      const response = await this.httpClient.get(`${mailerUrl}/mail/health`);
      return response.data;
    } catch (error: any) {
      this.logger.warn(`Failed to get mailer health: ${error.message}`);
      return null;
    }
  }

  /**
   * Get mailer queue status
   */
  async getMailerQueueStatus(selectedIp?: string): Promise<any> {
    const mailerUrl = this.getMailerUrl(selectedIp);

    if (!mailerUrl) {
      return null;
    }

    try {
      const response = await this.httpClient.get(`${mailerUrl}/mail/queue`);
      return response.data;
    } catch (error: any) {
      this.logger.warn(`Failed to get mailer queue status: ${error.message}`);
      return null;
    }
  }

  /**
   * Send test emails via mailer service
   */
  async sendTestEmails(
    createCampaignDto: CreateCampaignDto,
    smtpConfig: any,
  ): Promise<{
    message: string;
    success: boolean;
    sent: string[];
    failed: string[];
    emailSent: number;
    emailFailed: number;
  }> {
    const mailerUrl = this.getMailerUrl(createCampaignDto.selectedIp);

    if (!mailerUrl) {
      throw new HttpException(
        'Mailer service URL not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!this.mailerAuthToken) {
      throw new HttpException(
        'Mailer authentication token not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Extract domain and IP from selectedIp
      const domain = createCampaignDto.selectedIp?.split('-')[0]?.trim();

      // Build SMTP config for mailer service
      const mailerSmtpConfig = {
        host: smtpConfig.host || `mail.${domain}`,
        user: smtpConfig.user || `admin@${domain}`,
        port: smtpConfig.port || 587,
      };

      // Prepare request payload
      const payload = {
        from: createCampaignDto.from,
        fromName: createCampaignDto.fromName,
        subject: createCampaignDto.subject,
        emailTemplate: createCampaignDto.emailTemplate,
        offerId: createCampaignDto.offerId,
        campaignId: createCampaignDto.campaignId,
        to: createCampaignDto.to,
        selectedIp: createCampaignDto.selectedIp,
        smtpConfig: mailerSmtpConfig,
      };

      this.logger.log(
        `Calling mailer service to send test emails for campaign: ${createCampaignDto.campaignId}`,
      );

      const response = await this.httpClient.post(
        `${mailerUrl}/mail/test`,
        payload,
      );

      return {
        message: response.data.message || 'Test emails sent',
        success: response.data.success || false,
        sent: response.data.sent || [],
        failed: response.data.failed || [],
        emailSent: response.data.emailSent || 0,
        emailFailed: response.data.emailFailed || 0,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to send test emails on mailer service: ${error.message}`,
        error.response?.data,
      );

      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Mailer service error',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        `Failed to connect to mailer service: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
