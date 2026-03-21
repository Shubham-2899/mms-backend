import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServerDomainDocument = ServerDomain & Document;

/**
 * Warming lifecycle for an IP address:
 *
 *  cold     → newly added, never sent from. Excluded from round-robin automatically.
 *  warming  → user has started warming this IP. Still excluded from round-robin bulk
 *             campaigns, but can be targeted directly via ipMode: 'single'.
 *  warmed   → fully warmed. Included in round-robin freely.
 *
 * Promotion is intentionally manual — reputation depends on bounce/complaint rates,
 * not just send volume. The user/admin decides when an IP is ready.
 */
export type WarmingStatus = 'cold' | 'warming' | 'warmed';

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

  @Prop({
    required: true,
    enum: ['cold', 'warming', 'warmed'],
    default: 'cold',
  })
  warmingStatus: WarmingStatus;
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
