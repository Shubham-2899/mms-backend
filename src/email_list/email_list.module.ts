import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailListService } from './email_list.service';
import { EmailListController } from './email_list.controller';
import { EmailList, EmailListSchema } from './schemas/email_list.schemas';
import {
  CampaignEmailTracking,
  CampaignEmailTrackingSchema,
  Campaign,
  CampaignSchema,
} from '../campaign/schemas/campaign.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailList.name, schema: EmailListSchema }, // For email_list collection
      { name: CampaignEmailTracking.name, schema: CampaignEmailTrackingSchema }, // For campaign_email_tracking collection
      { name: Campaign.name, schema: CampaignSchema }, // For campaigns collection
    ]),
  ],
  controllers: [EmailListController],
  providers: [EmailListService],
})
export class EmailListModule {}
