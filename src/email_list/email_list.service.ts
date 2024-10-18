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

  // Regular expression for email validation
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Add emails via array
  async addEmails(emailArray: string[]): Promise<any> {
    try {
      // Filter out invalid emails
      const validEmails = emailArray.filter((email) =>
        this.emailRegex.test(email),
      );

      // If no valid emails, throw an error
      if (!validEmails.length) {
        throw new BadRequestException('No valid emails provided.');
      }

      // Prepare bulk operations for valid emails
      const bulkOps = validEmails.map((email) => ({
        updateOne: {
          filter: { email }, // Check if the email already exists
          update: { $setOnInsert: { email } }, // Insert only if it doesn't exist
          upsert: true, // Ensures new emails are added, existing ones are ignored
        },
      }));

      // Perform bulkWrite operation
      const result = await this.emailListModel.bulkWrite(bulkOps);

      return {
        message: 'Emails processed successfully.',
        success: true,
        insertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (err) {
      console.log('Error while processing emails:', err.message);
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
