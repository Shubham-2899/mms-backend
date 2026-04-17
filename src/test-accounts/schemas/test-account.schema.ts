import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestAccountDocument = TestAccount & Document;

@Schema({ collection: 'test_accounts', timestamps: true })
export class TestAccount {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  appPassword: string;

  /** Provider — extensible for future inbox providers */
  @Prop({ default: 'yahoo' })
  provider: string;

  @Prop({ default: true })
  active: boolean;
}

export const TestAccountSchema = SchemaFactory.createForClass(TestAccount);
