import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BouncedEmailDocument = BouncedEmail & Document;

/**
 * Bounce types:
 *  hard — permanent failure (5.x.x). Address/domain doesn't exist. Never send again.
 *  soft — temporary failure (4.x.x). Mailbox full, server busy. May recover.
 */
export type BounceType = 'hard' | 'soft';

@Schema({ collection: 'bounced_emails', timestamps: true })
export class BouncedEmail {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  domain: string; // sending domain that received the bounce

  @Prop({ required: true, enum: ['hard', 'soft'] })
  bounceType: BounceType;

  /** DSN status code from the NDR e.g. "5.1.1" */
  @Prop()
  statusCode?: string;

  /** Raw diagnostic message from the NDR */
  @Prop()
  diagnosticMessage?: string;

  @Prop({ required: true })
  bouncedAt: Date;
}

export const BouncedEmailSchema = SchemaFactory.createForClass(BouncedEmail);

// Compound index: one record per email+domain combination is enough for lookups
BouncedEmailSchema.index({ email: 1, domain: 1 });
