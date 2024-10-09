import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { EmailListService } from './email_list.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@UseGuards(FirebaseAuthGuard)
@UseGuards(AdminAuthGuard)
@Controller('/api/email_list')
export class EmailListController {
  constructor(private readonly emailListService: EmailListService) {}

  // Add emails from an array
  @Post('add-emails')
  async addEmails(@Body('emails') emails: string[]): Promise<string> {
    if (!Array.isArray(emails) || !emails.length) {
      throw new BadRequestException('Emails must be a non-empty array');
    }
    return await this.emailListService.addEmails(emails);
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
  async uploadCSV(@UploadedFile() file: Express.Multer.File): Promise<any> {
    console.log('🚀 ~ EmailListController ~ uploadCSV ~ file:', file);
    if (!file) {
      throw new BadRequestException('CSV file must be provided.');
    }

    const filePath = path.join(__dirname, '../../uploads', file.filename);

    try {
      // Process the CSV file (this can throw errors if invalid)
      await this.emailListService.addEmailsFromCSVFile(filePath);

      // Remove the file after processing
      fs.unlinkSync(filePath);

      return {
        message: 'Emails added successfully from CSV.',
        success: true,
      };
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
}