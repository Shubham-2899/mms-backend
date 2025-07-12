import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('/api/campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('create')
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @Headers('Authorization') token: string,
  ) {
    // Extract the token from the Authorization header
    const firebaseToken = token.split(' ')[1];
    return this.campaignService.createCampaign(createCampaignDto, firebaseToken);
  }

  @Put(':campaignId/pause')
  async pauseCampaign(@Param('campaignId') campaignId: string) {
    return this.campaignService.pauseCampaign(campaignId);
  }

  @Put(':campaignId/resume')
  async resumeCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @Headers('Authorization') token: string,
  ) {
    // Extract the token from the Authorization header
    const firebaseToken = token.split(' ')[1];
    return this.campaignService.resumeCampaignWithToken(createCampaignDto, firebaseToken);
  }

  @Get('stats/:campaignId')
  async getCampaignStats(@Param('campaignId') campaignId: string) {
    return this.campaignService.getCampaignStats(campaignId);
  }

  @Get('all')
  async getAllCampaigns() {
    return this.campaignService.getAllCampaigns();
  }

  @Post('stopjob')
  async stopJob(@Body() jobId: string) {
    return this.campaignService.stopJob(jobId);
  }

  @Post(':campaignId/cleanup')
  async cleanupCampaignData(@Param('campaignId') campaignId: string) {
    return this.campaignService.cleanupCampaignData(campaignId);
  }

  @Get(':campaignId/cleanup-status')
  async getCampaignCleanupStatus(@Param('campaignId') campaignId: string) {
    return this.campaignService.getCampaignCleanupStatus(campaignId);
  }
} 