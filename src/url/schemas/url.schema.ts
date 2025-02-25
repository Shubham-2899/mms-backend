import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UrlDocument = HydratedDocument<Url>;

@Schema({ timestamps: true })
export class Url {
  @Prop({ required: true, unique: true })
  shortId: string;

  @Prop({ required: true })
  redirectURL: string;

  @Prop({ required: true })
  offerId: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ required: true })
  linkType: string;

  @Prop({ required: true })
  campaignId: string;

  @Prop(
    raw([
      {
        timestamp: { type: Number },
        ipAddress: { type: String },
        userAgent: { type: String },
      },
    ]),
  )
  visitHistory: Record<string, any>[];

  @Prop({ default: 0 })
  clickCount: number;

  @Prop({ default: 0 })
  openRate: number;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
