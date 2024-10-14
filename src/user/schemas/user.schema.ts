import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

class serverInstance {
  @Prop({ required: true })
  ip: string;

  @Prop()
  host: string;

  @Prop({ required: true, enum: ['active', 'inactive'] })
  status: string;

  @Prop({ required: true })
  isMainIp: boolean;

  @Prop({ required: true })
  provider: string;
}

// class ServerData {
//   @Prop({ required: true })
//   provider: string;

//   @Prop({ type: [Instance], required: true })
//   instances: Instance[];
// }

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

  @Prop({ type: [serverInstance], required: true })
  serverData: serverInstance[];

  @Prop({ required: true })
  isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
