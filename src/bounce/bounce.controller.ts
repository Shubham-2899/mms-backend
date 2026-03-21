import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { BouncePollerService } from './bounce-poller.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BouncedEmail,
  BouncedEmailDocument,
} from './schemas/bounced-email.schema';

@Controller('/api/bounces')
export class BounceController {
  constructor(
    private readonly bouncePollerService: BouncePollerService,
    @InjectModel(BouncedEmail.name)
    private bouncedEmailModel: Model<BouncedEmailDocument>,
  ) {}

  /**
   * GET /api/bounces
   * List bounced emails. Supports filtering by domain, bounceType, and pagination.
   */
  @Get()
  async list(
    @Query('domain') domain?: string,
    @Query('type') bounceType?: 'hard' | 'soft',
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const filter: any = {};
    if (domain) filter.domain = domain;
    if (bounceType) filter.bounceType = bounceType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.bouncedEmailModel
        .find(filter)
        .sort({ bouncedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      this.bouncedEmailModel.countDocuments(filter),
    ]);

    return { success: true, data, total, page: pageNum, limit: limitNum };
  }

  /**
   * POST /api/bounces/poll/:domain
   * Manually trigger a bounce poll for a specific domain.
   * Useful for testing or immediate refresh without waiting for the cron.
   */
  @Post('poll/:domain')
  async pollDomain(@Param('domain') domain: string) {
    const result = await this.bouncePollerService.pollDomain(domain);
    return { success: true, ...result };
  }

  /**
   * POST /api/bounces/poll
   * Manually trigger a full poll across all active domains.
   */
  @Post('poll')
  async pollAll() {
    await this.bouncePollerService.pollAllDomains();
    return {
      success: true,
      message: 'Bounce poll triggered for all active domains',
    };
  }

  /**
   * POST /api/bounces/check
   * Check if a list of emails contains any known hard bounces.
   * Body: { emails: string[] }
   */
  @Post('check')
  async checkEmails(@Body() body: { emails: string[] }) {
    if (!Array.isArray(body.emails) || !body.emails.length) {
      return { success: false, message: 'emails array is required' };
    }
    const hardBounced = await this.bouncePollerService.filterHardBounces(
      body.emails,
    );
    return {
      success: true,
      hardBounced: Array.from(hardBounced),
      count: hardBounced.size,
    };
  }

  /**
   * DELETE /api/bounces/:email
   * Remove a specific email from the bounce list (admin correction).
   */
  @Delete(':email')
  async remove(@Param('email') email: string) {
    const result = await this.bouncedEmailModel.deleteMany({
      email: email.toLowerCase(),
    });
    return { success: true, deletedCount: result.deletedCount };
  }
}
