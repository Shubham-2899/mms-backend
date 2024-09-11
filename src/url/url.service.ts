import { BadRequestException, Injectable, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
const shortid = require('shortid');
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class UrlService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  /**
   * creates shortId for redirection
   * @param createUrlDto
   * @returns
   */
  async create(createUrlDto: CreateUrlDto): Promise<any> {
    const body = createUrlDto;
    console.log('req body', body);

    if (!body.url) throw new BadRequestException('Url is required');

    const shortID = shortid();

    const createdUrl = new this.urlModel({
      shortId: shortID,
      redirectURL: body.url,
      domain: body.domain,
      offerId: body.offerId,
      campaignId: body.campaignId,
      linkType: body.linkType,
      visitHistory: [],
    });

    createdUrl.save();

    return { finalRedirectLink: `${body.domain}/${shortID}` };
  }

  async getAnalytics(shortId: string): Promise<any> {
    const result = await this.urlModel.findOne({ shortId });

    if (result) {
      return {
        offerId: result.offerId,
        campaignId: result.campaignId,
        totalClicks: result.clickCount,
        analytics: result.visitHistory,
      };
    } else {
      return {};
    }
  }

  /**
   *
   * @returns all the reports
   */
  async getReports(): Promise<any> {
    try {
      const allUrls = await this.urlModel.find(
        {},
        { offerId: 1, clickCount: 1, visitHistory: 1, campaignId: 1 },
      );

      const reports = allUrls.map((url) => ({
        offerId: url.offerId,
        totalClicks: url.clickCount,
        analytics: url.visitHistory,
        campaignId: url.campaignId,
      }));

      return reports;
    } catch (error) {
      console.log('🚀 ~ UrlService ~ getReports ~ error:', error);
      // res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
