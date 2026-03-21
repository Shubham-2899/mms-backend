import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServerDomainDocument = ServerDomain & Document;

@Schema({ _id: false })
export class IpEntry {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true, default: true })
  isMainIp: boolean;

  @Prop({ required: true, default: false })
  wentSpam: boolean;

  @Prop({ required: true })
  provider: string;
}

export const IpEntrySchema = SchemaFactory.createForClass(IpEntry);

/**
 * Each document = 1 server (main IP + sub IPs) tied to exactly 1 sending domain.
 * A domain cannot belong to multiple servers.
 */
@Schema({ timestamps: true })
export class ServerDomain {
  @Prop({ required: true, unique: true })
  domain: string;

  @Prop({ type: [IpEntrySchema], required: true, default: [] })
  availableIps: IpEntry[];

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop()
  notes: string;
}

export const ServerDomainSchema = SchemaFactory.createForClass(ServerDomain);
