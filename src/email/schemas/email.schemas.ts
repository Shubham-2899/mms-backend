import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  response: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  offerId: string;

  @Prop({ required: true })
  campaignId: string;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop({ default: 'test' })
  mode: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
