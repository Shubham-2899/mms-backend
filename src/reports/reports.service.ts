import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailDocument } from 'src/email/schemas/email.schemas';
import { UrlDocument } from 'src/url/schemas/url.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('Url') private readonly urlModel: Model<UrlDocument>,
    @InjectModel('Email') private readonly emailModel: Model<EmailDocument>,
  ) {}

  async getReports(
    page: number,
    pageSize: number,
    offerId?: string,
    campaignId?: string,
    fromDate?: string,
    toDate?: string,
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const dateFilter: Record<string, any> = {};
      if (fromDate) dateFilter.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      const matchStage: Record<string, any> = {
        ...(offerId && { offerId: { $regex: `^${offerId}$`, $options: 'i' } }),
        ...(campaignId && { campaignId: { $regex: `^${campaignId}$`, $options: 'i' } }),
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      };

      const aggregatedData = await this.urlModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'emails',
            let: { campaignId: '$campaignId', offerId: '$offerId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$campaignId', '$$campaignId'] },
                      { $eq: ['$offerId', '$$offerId'] },
                    ],
                  },
                  mode: { $in: ['manual', 'bulk'] },
                },
              },
            ],
            as: 'emailData',
          },
        },
        { $addFields: { totalEmailSent: { $size: '$emailData' } } },
        {
          $project: {
            _id: 0,
            campaignId: 1,
            offerId: 1,
            clickCount: 1,
            totalEmailSent: 1,
            openRate: { $ifNull: ['$openRate', 0] },
            date: { $ifNull: ['$createdAt', new Date()] },
          },
        },
        { $sort: { date: -1 } },
        { $skip: skip },
        { $limit: Number(pageSize) },
      ]);

      const totalElements = await this.urlModel.countDocuments(matchStage);

      return { reports: aggregatedData, page, pageSize, totalElements };
    } catch (err: any) {
      console.log('error while fetching reports', err.message);
    }
  }

  /**
   * Daily sending report — per IP breakdown for a given date.
   * Groups by domainUsed + ipUsed, counts sent vs failed.
   * Optionally filters by inbox provider (gmail, yahoo, aol, comcast, etc.)
   *
   * NOTE: "deferred" is not available without MTA accounting log integration.
   * See docs/mta-accounting-log-plan.md for future implementation.
   */
  async getDailySendingReport(date: string, provider?: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const matchStage: Record<string, any> = {
      sentAt: { $gte: start, $lte: end },
      mode: { $in: ['bulk', 'manual'] },
      ipUsed: { $ne: null },
    };

    // Provider filter — match recipient domain
    if (provider) {
      const providerDomains: Record<string, string[]> = {
        gmail: ['gmail.com', 'googlemail.com'],
        yahoo: ['yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'ymail.com'],
        aol: ['aol.com'],
        comcast: ['comcast.net'],
        hotmail: ['hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com'],
      };
      const domains = providerDomains[provider.toLowerCase()];
      if (domains) {
        matchStage['to'] = {
          $regex: `@(${domains.map((d) => d.replace('.', '\\.')).join('|')})$`,
          $options: 'i',
        };
      }
    }

    const rows = await this.emailModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { domain: '$domainUsed', ip: '$ipUsed' },
          sent: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$response', regex: /^250/ } }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$response', regex: /^250/ } }, 0, 1],
            },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          domain: '$_id.domain',
          ip: '$_id.ip',
          sent: 1,
          failed: 1,
          total: 1,
        },
      },
      { $sort: { domain: 1, ip: 1 } },
    ]);

    const totals = rows.reduce(
      (acc, r) => ({
        sent: acc.sent + r.sent,
        failed: acc.failed + r.failed,
        total: acc.total + r.total,
      }),
      { sent: 0, failed: 0, total: 0 },
    );

    return { date, provider: provider || 'all', rows, totals };
  }

  /**
   * Hourly sending report — per IP, broken down by hour of day (H0–H23).
   * Shows how many emails each IP sent per hour for a given date.
   */
  async getHourlySendingReport(date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const rows = await this.emailModel.aggregate([
      {
        $match: {
          sentAt: { $gte: start, $lte: end },
          mode: { $in: ['bulk', 'manual'] },
          ipUsed: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            domain: '$domainUsed',
            ip: '$ipUsed',
            hour: { $hour: '$sentAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { domain: '$_id.domain', ip: '$_id.ip' },
          hours: {
            $push: { hour: '$_id.hour', count: '$count' },
          },
          total: { $sum: '$count' },
        },
      },
      {
        $project: {
          _id: 0,
          domain: '$_id.domain',
          ip: '$_id.ip',
          hours: 1,
          total: 1,
        },
      },
      { $sort: { domain: 1, ip: 1 } },
    ]);

    // Normalize hours array into H0–H23 flat object per row
    const normalized = rows.map((row) => {
      const hourMap: Record<string, number> = {};
      for (let h = 0; h < 24; h++) hourMap[`H${h}`] = 0;
      row.hours.forEach((h: { hour: number; count: number }) => {
        hourMap[`H${h.hour}`] = h.count;
      });
      return { domain: row.domain, ip: row.ip, total: row.total, ...hourMap };
    });

    return { date, rows: normalized };
  }
}
