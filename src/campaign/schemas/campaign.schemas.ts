import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;
export type CampaignEmailTrackingDocument = CampaignEmailTracking & Document;

// Campaign Management Schema
@Schema({ collection: 'campaigns', timestamps: true })
export class Campaign {
  @Prop({ required: true, unique: true })
  campaignId: string;

  @Prop({ enum: ['draft', 'ready', 'running', 'paused', 'completed', 'ended'], default: 'draft' })
  status: string;

  @Prop()
  from: string;

  @Prop()
  fromName: string;

  @Prop()
  subject: string;

  @Prop()
  templateType: string;

  @Prop()
  emailTemplate: string;

  @Prop()
  offerId: string;

  @Prop()
  selectedIp: string;

  /** 'single' | 'round-robin' — controls IP selection at send time */
  @Prop({ enum: ['single', 'round-robin'], default: 'single' })
  ipMode?: string;

  /** Resolved IP list used for this campaign run (populated by resolveAllIps) */
  @Prop({ type: [String], default: [] })
  allIps?: string[];

  @Prop()
  batchSize: number;

  @Prop()
  delay: number;

  @Prop()
  jobId?: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 0 })
  pendingEmails?: number;

  @Prop()
  totalEmails?: number;

  @Prop()
  sentEmails?: number;

  @Prop()
  failedEmails?: number;

  /** Deliverability checkpoint fields */
  @Prop({ enum: ['idle', 'checking', 'inbox', 'spam'], default: 'idle' })
  checkpointStatus?: string;

  @Prop({ default: 0 })
  emailsSinceLastCheck?: number;

  /**
   * Per-campaign checkpoint interval (emails sent between checks).
   * If omitted, mailer-service falls back to CHECKPOINT_INTERVAL env var (default 500).
   */
  @Prop()
  checkpointInterval?: number;
}

// Email Queue/Status Tracking Schema (Minimal fields)
@Schema({ collection: 'campaign_email_tracking', timestamps: true })
export class CampaignEmailTracking {
  @Prop({
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  to_email: string;

  @Prop({ required: true })
  campaignId: string;

  @Prop({ default: 'pending' })
  status: string; // 'pending', 'sent', 'failed'

  @Prop({ default: false })
  isProcessed: boolean;

  @Prop()
  sentAt?: Date;

  @Prop()
  errorMessage?: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
export const CampaignEmailTrackingSchema = SchemaFactory.createForClass(CampaignEmailTracking);

// Compound index for the hot query path in the sending loop:
// find({ campaignId, status: 'pending', isProcessed: false }).limit(batchSize)
CampaignEmailTrackingSchema.index(
  { campaignId: 1, status: 1, isProcessed: 1 },
  { name: 'idx_campaign_status_processed' },
);