import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailListDocument = EmailList & Document;

@Schema({ collection: 'campaign_email_tracking', timestamps: true })
export class EmailList {
  @Prop({
    required: false,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  from: string;

  // Response from the SMTP server
  @Prop({ required: false })
  response: string;

  // To email address
  @Prop({
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  to_email: string;

  // Offer reference (could be a string or ObjectId, based on your system)
  @Prop({ required: false })
  offerId: string; // Keeping this as a string (if you want it to be ObjectId, change to MongooseSchema.Types.ObjectId)

  // Campaign reference (could be a string or ObjectId)
  @Prop({ required: true })
  campaignId: string; // Keeping this as a string (same as offerId, adjust if it's ObjectId)

  // Timestamp for when the email was sent
  @Prop({ required: false })
  sentAt: Date;

  // Flag to track if the email is processed (opened, clicked, etc.)
  @Prop({ default: false })
  isProcessed: boolean;

  // Status of the email (e.g., sent, bounced, opened)
  @Prop({ default: 'pending' })
  status: string;
}

export const EmailListSchema = SchemaFactory.createForClass(EmailList);
