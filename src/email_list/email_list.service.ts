import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { EmailList, EmailListDocument } from './schemas/email_list.schemas';

@Injectable()
export class EmailListService {
  constructor(
    @InjectModel(EmailList.name)
    private emailListModel: Model<EmailListDocument>,
  ) {}

  // Add emails via array
  async addEmails(emailArray: string[]): Promise<any> {
    try {
      const emailDocs = emailArray.map((email) => ({ email }));
      await this.emailListModel.insertMany(emailDocs, { ordered: false });
      return {
        message: 'Emails added successfully.',
        success: true,
      };
    } catch (err) {
      console.log('error while adding emails:', err.message);
      return {
        message: err.message,
        success: false,
      };
    }
  }

  // Process the CSV file from disk
  async addEmailsFromCSVFile(filePath: string): Promise<void> {
    const emails: string[] = [];

    return new Promise((resolve, reject) => {
      const stream = fs
        .createReadStream(filePath)
        .pipe(
          parse({
            delimiter: ',',
            columns: true, // Assumes CSV has headers
            trim: true,
          }),
        )
        .on('data', (row) => {
          if (row.emails) {
            emails.push(row.emails);
          }
        })
        .on('end', async () => {
          if (!emails.length) {
            return reject(
              new BadRequestException('No emails found in the CSV file.'),
            );
          }

          // Add emails to the database
          const res = await this.addEmails(emails);
          if (res.success) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .on('error', (err) => {
          console.error('Error reading CSV file:', err);
          reject(new BadRequestException('Failed to process the CSV file.'));
        });
    });
  }
}
