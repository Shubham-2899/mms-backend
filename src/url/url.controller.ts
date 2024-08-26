import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller('/api/url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  createNewShortUrl(@Body() createUrlDto: CreateUrlDto): any {
    return this.urlService.create(createUrlDto);
  }

  /**
   * route to fetch the reports
   * @param shortId if present fetches reports of that shortId else return all reports
   * @returns
   */
  @Get('/reports')
  async getReports(@Query('shortId') shortId: string) {
    if (shortId) {
      return this.urlService.getAnalytics(shortId);
    }
    return this.urlService.getReports();
  }
}
