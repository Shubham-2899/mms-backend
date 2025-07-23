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