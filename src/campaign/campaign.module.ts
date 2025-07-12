import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignProcessor } from './campaign.processor';
import { Campaign, CampaignSchema, CampaignEmailTracking, CampaignEmailTrackingSchema } from './schemas/campaign.schemas';
import { Email, EmailSchema } from 'src/email/schemas/email.schemas';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignEmailTracking.name, schema: CampaignEmailTrackingSchema },
      { name: Email.name, schema: EmailSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    AuthModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignProcessor],
  exports: [CampaignService],
})
export class CampaignModule {} 