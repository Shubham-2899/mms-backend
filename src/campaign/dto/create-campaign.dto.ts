export class CreateCampaignDto {
  from: string;
  fromName: string;
  subject: string;
  to: string[]; // only used in test mode
  templateType: string;
  emailTemplate: string;
  mode: string; // 'test' or 'bulk'
  offerId: string;
  campaignId: string;
  selectedIp: string; // e.g. 'example.com-192.168.0.1'
  batchSize: number; // e.g. 5 or 10
  delay: number; // seconds between batches
} 