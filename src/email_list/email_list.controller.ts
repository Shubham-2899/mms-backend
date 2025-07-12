import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  Get,
} from '@nestjs/common';
import { EmailListService } from './email_list.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// @UseGuards(FirebaseAuthGuard)
// @UseGuards(AdminAuthGuard)
@Controller('/api/email_list')
export class EmailListController {
  constructor(private readonly emailListService: EmailListService) {}

  // Add emails from an array
  @Post('add-emails')
  async addEmails(
    @Body() body: { emails: string[]; campaignId: string },
  ): Promise<string> {
    const { emails, campaignId } = body;

    if (!Array.isArray(emails) || !emails.length) {
      throw new BadRequestException('Emails must be a non-empty array');
    }

    if (!campaignId) {
      throw new BadRequestException('Campaign ID is required');
    }

    return await this.emailListService.addEmails(emails, campaignId);
  }

  // Add emails from a CSV file
  @Post('upload-emails')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueSuffix);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.includes('csv')) {
          return cb(
            new BadRequestException('Only CSV files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body('campaignId') campaignId: string, // Extract the campaignId from the body
  ): Promise<any> {
    console.log('🚀 ~ EmailListController ~ uploadCSV ~ file:', file);
    console.log(
      '🚀 ~ EmailListController ~ uploadCSV ~ campaignId:',
      campaignId,
    );

    if (!file) {
      throw new BadRequestException('CSV file must be provided.');
    }

    if (!campaignId) {
      throw new BadRequestException('Campaign ID is required.');
    }

    const filePath = path.join(__dirname, '../../uploads', file.filename);

    try {
      // Process the CSV file (this can throw errors if invalid)
      const res = await this.emailListService.addEmailsFromCSVFile(
        filePath,
        campaignId,
      );

      // Remove the file after processing
      fs.unlinkSync(filePath);

      return res;
    } catch (error) {
      // Clean up the file if there was an error during processing
      console.log(
        '🚀 ~ EmailListController ~ uploadCSV ~ error.message:',
        error.message,
      );
      fs.unlinkSync(filePath);
      throw new BadRequestException(error.message);
    }
  }

  //suppressions
  @Get('/suppressions')
  async getSuppressionList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const result = await this.emailListService.getSuppressionList(
      pageNum,
      limitNum,
      fromDate,
      toDate,
    );

    return {
      message: 'Suppression list fetched successfully.',
      success: true,
      ...result,
    };
  }
}
