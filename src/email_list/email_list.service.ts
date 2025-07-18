import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import {
  CampaignEmailTracking,
  CampaignEmailTrackingDocument,
} from '../campaign/schemas/campaign.schemas';
import { EmailList, EmailListDocument } from './schemas/email_list.schemas';

@Injectable()
export class EmailListService {
  constructor(
    @InjectModel(CampaignEmailTracking.name)
    private campaignEmailTrackingModel: Model<CampaignEmailTrackingDocument>, // For campaign_email_tracking
    @InjectModel(EmailList.name)
    private emailListModel: Model<EmailListDocument>, // For email_list (suppression)
  ) {}

  // Regular expression for email validation
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Add emails via array to campaign_email_tracking
  async addEmails(emailArray: string[], campaignId: string): Promise<any> {
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
          filter: { to_email: email, campaignId }, // Ensure uniqueness by email and campaignId
          update: {
            $setOnInsert: {
              to_email: email, // Insert the email into the 'to_email' field
              campaignId, // Attach the campaign ID
              status: 'pending', // Default status
              isProcessed: false, // Default to unprocessed
            },
          },
          upsert: true, // Ensures new emails are added, existing ones are ignored
        },
      }));

      // Perform bulkWrite operation
      const result = await this.campaignEmailTrackingModel.bulkWrite(bulkOps);

      return {
        message: 'Emails processed successfully.',
        success: true,
        insertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        campaignId,
      };
    } catch (err) {
      console.log('Error while processing emails:', err.message);
      return {
        message: err.message,
        success: false,
      };
    }
  }

  // Process the CSV file from disk for campaign_email_tracking
  async addEmailsFromCSVFile(
    filePath: string,
    campaignId: string,
  ): Promise<void> {
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
          const res = await this.addEmails(emails, campaignId);
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

  // Suppression list functionality (uses email_list collection)
  async getSuppressionList(
    page = 1,
    limit = 10,
    fromDate?: string,
    toDate?: string,
  ) {
    const filter: any = {};

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        const from = new Date(fromDate);
        if (!isNaN(from.getTime())) {
          filter.createdAt.$gte = from;
        }
      }
      if (toDate) {
        const to = new Date(toDate);
        if (!isNaN(to.getTime())) {
          to.setHours(23, 59, 59, 999); // end of day
          filter.createdAt.$lte = to;
        }
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.emailListModel
        .find(filter)
        .sort({ createdAt: -1 }) // descending by date
        .skip(skip)
        .limit(limit)
        .lean(),
      this.emailListModel.countDocuments(filter),
    ]);

    const formatted = data.map((item: any) => ({
      email: item.email,
      date: item.createdAt.toISOString().split('T')[0],
      domain: item.unsubscribed_domains.toString(),
    }));

    return {
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
