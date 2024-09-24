import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

class Instance {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true, enum: ['active', 'inactive'] })
  status: string;

  @Prop({ required: true })
  isMainIp: boolean;
}

class ServerData {
  @Prop({ required: true })
  provider: string;

  @Prop({ type: [Instance], required: true })
  instances: Instance[];
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;

  @Prop({ type: [ServerData], required: true })
  serverData: ServerData[];

  @Prop({ required: true })
  isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
