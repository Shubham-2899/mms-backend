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
  ) {
    const skip = (page - 1) * pageSize;
    console.log('offerId campaignId =>', offerId, campaignId);
    console.log('🚀 ~ ReportsService ~ getReports ~ skip:', skip);
    try {
      const searchFilter: Record<string, any> = {};
      if (offerId) searchFilter.offerId = offerId;
      if (campaignId) searchFilter.campaignId = campaignId;
      console.log('🚀 ~ ReportsService ~ searchFilter:', searchFilter);

      // Aggregate data from Url and Email collections
      const aggregatedData = await this.urlModel.aggregate([
        {
          $match: searchFilter,
        },
        {
          // Match only the necessary fields
          $lookup: {
            from: 'emails', // The collection name for the Email schema
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
                  mode: 'bulk',
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
            date: { $ifNull: ['$createdAt', new Date()] },
          },
        },
        // { $sort: { date: -1 } }, // Sort by date
        { $skip: skip },
        { $limit: Number(pageSize) || pageSize },
      ]);

      // Get total count for pagination
      const totalElements = await this.urlModel.countDocuments(searchFilter);

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
