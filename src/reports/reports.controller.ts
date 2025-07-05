import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('/api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReports(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('offerId') offerId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const result = await this.reportsService.getReports(
      page,
      pageSize,
      offerId,
      campaignId,
      fromDate,
      toDate,
    );
    return {
      message: 'Reports fetched successfully.',
      success: true,
      ...result,
    };
  }
}
