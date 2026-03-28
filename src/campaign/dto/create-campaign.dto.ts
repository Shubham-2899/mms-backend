export class CreateCampaignDto {
  from: string;
  fromName: string;
  subject: string;
  to: string[]; // only used in test mode
  templateType: string;
  emailTemplate: string;
  mode: string; // 'test', 'manual', or 'bulk'
  offerId: string;
  campaignId: string;
  selectedIp: string; // e.g. 'example.com - 192.168.0.1'
  batchSize: number; // e.g. 5 or 10
  delay: number; // seconds between batches
  /**
   * Controls IP selection strategy:
   *  'single'      — use only selectedIp. Works regardless of how many IPs the VPS has.
   *                  Use this for test sends, manual sends, and IP warming runs.
   *  'round-robin' — auto-resolve all warmed, non-spam IPs for the domain and rotate
   *                  through them. Each recipient gets exactly one email.
   *
   * Defaults to 'single' if omitted.
   */
  ipMode?: 'single' | 'round-robin';
} 