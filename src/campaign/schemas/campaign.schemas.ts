import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;
export type CampaignEmailTrackingDocument = CampaignEmailTracking & Document;

// Campaign Management Schema
@Schema({ collection: 'campaigns', timestamps: true })
export class Campaign {
  @Prop({ required: true, unique: true })
  campaignId: string;

  @Prop({ enum: ['running', 'paused', 'completed'], default: 'paused' })
  status: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  fromName: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  templateType: string;

  @Prop({ required: true })
  emailTemplate: string;

  @Prop({ required: true })
  offerId: string;

  @Prop({ required: true })
  selectedIp: string;

  @Prop({ required: true })
  batchSize: number;

  @Prop({ required: true })
  delay: number;

  @Prop()
  jobId?: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

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