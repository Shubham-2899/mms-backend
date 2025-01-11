import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Request,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
const shortid = require('shortid');
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';
import { CreateUrlDto } from './dto/create-url.dto';

// Helper function to generate random alphabetic string
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

    const [part1, part2] = body.linkPattern.split('/').filter(Boolean);

    const RANDOM_STRING_LENGTH = 16;
    const randomString1 = generateRandomString(RANDOM_STRING_LENGTH);
    const randomString2 = generateRandomString(RANDOM_STRING_LENGTH);

    const finalLongString1 = `${part1}${randomString1}`;
    const finalLongString2 = `${part2}${randomString2}`;

    let shortID: string;
    let createdUrl;
    let finalRedirectLink: string;

    // Retry logic for unique shortId
    for (let attempt = 0; attempt < 3; attempt++) {
      // Maximum 3 retries
      shortID = shortid();

      createdUrl = new this.urlModel({
        shortId: shortID,
        redirectURL: body.url.trim(),
        domain: body.domain,
        offerId: body.offerId,
        campaignId: body.campaignId,
        linkType: body.linkType,
        visitHistory: [],
      });

      try {
        await createdUrl.save();
        finalRedirectLink = `${body.domain}/${shortID}/${finalLongString1}/${finalLongString2}`;

        return { finalRedirectLink };
      } catch (error) {
        if (error.code === 11000 && error.keyPattern?.shortId) {
          console.warn(
            `shortId conflict detected. Retrying... (Attempt ${attempt + 1})`,
          );
          continue; // Generate a new shortId and retry
        }
        // If it's not a duplicate key error, rethrow the error
        throw new InternalServerErrorException('Failed to save URL');
      }
    }

    throw new InternalServerErrorException(
      'Could not generate a unique shortId after multiple attempts',
    );
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
