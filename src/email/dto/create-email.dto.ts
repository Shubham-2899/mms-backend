export class CreateEmailDto {
  from: string;
  fromName: string;
  subject: string;
  to: string[];
  templateType: string;
  emailTemplate: string;
  mode: string;
  offerId: string;
  campaignId: string;
  selectedIp: string;
  batchSize: number; // number of emails to process at the time
  delay: number; // in seconds (NEW)
}
