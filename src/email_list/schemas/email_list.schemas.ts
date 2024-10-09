import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailListDocument = EmailList & Document;

@Schema({ collection: 'email_list', timestamps: true })
export class EmailList {
  @Prop({
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  email: string;

  @Prop({
    type: [String],
    default: [],
  })
  unsubscribed_domains: string[];

  //   @Prop({
  //     required: true,
  //     enum: ['gmail', 'yahoo', 'comcast', 'aol', 'other'],
  //   })
  //   provider_type: string;
}

export const EmailListSchema = SchemaFactory.createForClass(EmailList);
