import { AppService } from './app.service';
import { Controller, Get, Ip, Param, Res, Headers } from '@nestjs/common';
import { Response } from 'express';

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':shortId')
  async getRedirectUrl(
    @Res() response: Response,
    @Ip() ip,
    @Headers() headers: Record<string, string>,
    @Param('shortId') shortId: string,
  ) {
    try {
      return response.redirect(
        await this.appService.getRedirectUrl(shortId, headers, ip),
      );
    } catch (e) {
      console.log(e);
    }
    // return `User ID: ${shortId}`;
  }
}
