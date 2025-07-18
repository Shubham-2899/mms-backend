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
        // Include end of day for toDate
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      const matchStage: Record<string, any> = {
        ...(offerId && {
          offerId: { $regex: `^${offerId}$`, $options: 'i' },
        }),
        ...(campaignId && {
          campaignId: { $regex: `^${campaignId}$`, $options: 'i' },
        }),
        ...(Object.keys(dateFilter).length > 0 && {
          createdAt: dateFilter,
        }),
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
                      {
                        $eq: ['$campaignId', '$$campaignId'],
                      },
                      { $eq: ['$offerId', '$$offerId'] },
                    ],
                  },
                  mode: { $in: ['manual', 'bulk'] }, // 'manual' or 'bulk',
                },
              },
            ],
            as: 'emailData',
          },
        },
        {
          $addFields: {
            totalEmailSent: { $size: '$emailData' },
          },
        },
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

      return {
        reports: aggregatedData,
        page,
        pageSize,
        totalElements,
      };
    } catch (err: any) {
      console.log('error while fetching reports', err.message);
    }
  }
}
