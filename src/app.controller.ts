import { AppService } from './app.service';
import { Controller, Get, Ip, Param, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Not required as we are using different service for redirection
   * but keeping it for future reference
   */
  // @Get(':shortId/*/*')
  // async getRedirectUrl(
  //   @Res() response: Response,
  //   @Ip() ip,
  //   @Headers() headers: Record<string, string>,
  //   @Param('shortId') shortId: string,
  // ) {
  //   try {
  //     return response.redirect(
  //       await this.appService.getRedirectUrl(shortId, headers, ip),
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   // return `User ID: ${shortId}`;
  // }
  @Get('/')
  getHomePage(): string {
    const htmlFilePath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlFilePath, 'utf8');
    return htmlContent;
  }
}
