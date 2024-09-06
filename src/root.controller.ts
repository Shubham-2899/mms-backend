import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class RootController {
  @Get('/')
  getHomePage(): string {
    const htmlFilePath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlFilePath, 'utf8');
    return htmlContent;
  }
}
