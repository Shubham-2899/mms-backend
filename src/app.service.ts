import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './url/schemas/url.schema';
import { Model } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async getRedirectUrl(
    shortId: string,
    headers: Record<string, string>,
    ipAddress: string,
  ): Promise<any> {
    console.log('ip adddress', ipAddress);

    // Get user-agent header for device information
    const userAgent = headers['user-agent'];

    const entry = await this.urlModel.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
            ipAddress: ipAddress,
            userAgent: userAgent,
          },
        },
        $inc: { clickCount: 1 }, // Increment the click count by 1
      },
      { new: true }, // To return the modified document
    );
    console.log('entry', entry);
    if (entry?.redirectURL) {
      return entry.redirectURL;
    } else {
      throw new BadRequestException('Url is required');
    }
  }
}
