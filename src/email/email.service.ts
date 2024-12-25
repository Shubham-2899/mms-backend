import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schemas/email.schemas';
import { CreateEmailDto } from './dto/create-email.dto';
import { FirebaseService } from 'src/auth/firebase.service';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { createTransporter } from './mailer.util';
@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue, // Inject BullMQ Queue
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>, // Inject User model
    private firebaseService: FirebaseService, // Inject Firebase service
  ) {}

  // This method now adds email jobs to the queue
  async create(createEmailDto: CreateEmailDto, firebaseToken: string) {
    // console.log('🚀 ~ EmailService ~ create ~ firebaseToken:', firebaseToken);
    try {
      // Verify Firebase token and retrieve user ID
      const res = await this.firebaseService.verifyToken(firebaseToken);
      // console.log('🚀 ~ EmailService ~ create ~ res:', res);

      // Fetch the SMTP details using the userId (uid)
      const serverData = await this.fetchSmtpDetails(res.uid);
      // console.log('🚀 ~ EmailService ~ create ~ serverData:', serverData);

      const domain = createEmailDto.selectedIp?.split('-')[0]?.trim();
      const ip = createEmailDto.selectedIp?.split('-')[1]?.trim();

      const smtpConfig = {
        host: `mail.${domain}`,
        // ip: ip,
        user: `admin@${domain}`,
      };

      if (createEmailDto.mode === 'test') {
        console.log('inside the test mode');
        let {
          from,
          to,
          templateType,
          fromName,
          subject,
          emailTemplate,
          offerId,
          campaignId,
          selectedIp,
        } = createEmailDto;
        const transporter = createTransporter(smtpConfig);
        console.log('🚀 ~ EmailService ~ create ~ smtpConfig:', smtpConfig);
        emailTemplate = decodeURIComponent(emailTemplate);
        const headers = {
          'X-Outgoing-IP': ip,
        };

        const failedEmails = [];
        for (const userEmail of to) {
          try {
            console.log(`Sending email to ${userEmail}`);
            console.log('🚀 ~ EmailService ~ create ~ headers:', headers);

            const info = await transporter.sendMail({
              from: `${fromName} <${from}>`,
              to: userEmail,
              subject: subject,
              html: templateType === 'html' ? emailTemplate : emailTemplate,
              headers,
            });

            console.log('Email sent:', info.response);

            const emailRecord = new this.emailModel({
              from: from,
              to: userEmail,
              offerId: offerId,
              campaignId: campaignId,
              response: info.response,
              sentAt: new Date(),
              mode: 'test',
            });

            await emailRecord.save();
          } catch (e) {
            console.error(`Failed to send email to ${userEmail}: ${e.message}`);
            failedEmails.push(userEmail);
            const emailRecord = new this.emailModel({
              from: from,
              to: userEmail,
              offerId: offerId,
              campaignId: campaignId,
              response: `Failed: ${e.message}`,
              sentAt: new Date(),
              mode: 'test',
            });
            await emailRecord.save();
          }
        }

        const success = failedEmails.length === 0;
        const message = success
          ? 'Emails processed successfully'
          : `Emails processed successfully, with some failures.`;
        return {
          message: message,
          success: success,
          failedEmails,
          emailSent: to.length - failedEmails.length,
        };
      } else {
        console.log('inside bulk mode');
        // Add job to BullMQ queue
        if (createEmailDto.to.length === 0) {
          throw new Error('No recipient found');
        }
        const res = await this.emailQueue.add('send-email-job', {
          ...createEmailDto,
          smtpConfig,
        });
        // console.log('🚀 ~ EmailService ~ create ~ res:', res);

        return {
          message: 'Email job added to queue successfully',
          success: true,
          jobId: res.id,
        };
      }
    } catch (error) {
      console.log('🚀 ~ EmailService ~ create ~ error:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Method to fetch SMTP details based on user ID
  private async fetchSmtpDetails(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ firebaseUid: userId });

      if (!user) {
        throw new Error('User not found');
      }

      return user?.serverData;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch SMTP details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAvailableIps(firebaseToken: string): Promise<any> {
    try {
      // Verify Firebase token and retrieve user ID
      const res = await this.firebaseService.verifyToken(firebaseToken);
      // console.log('🚀 ~ EmailService ~ create ~ res:', res);

      // Fetch the SMTP details using the userId (uid)
      const serverdata = await this.fetchSmtpDetails(res.uid);
      // console.log(
      //   '🚀 ~ EmailService ~ getAvailableIps ~ smtpConfig:',
      //   serverdata,
      // );

      const domainIp = {};

      serverdata.forEach((server) => {
        // Only process servers that are active
        if (server.status === 'active') {
          // Extract the host name without "mail." prefix and capitalize the first letter
          const hostKey = server.host.replace(/^mail\./, '');
          // const capitalizedHostKey =
          //   hostKey.charAt(0).toUpperCase() + hostKey.slice(1);

          // Filter IPs that haven't gone to spam and mask two segments of each IP
          // const validIps = server.availableIps
          //   .filter((ip) => !ip.wentSpam)
          //   .map((ip) =>
          //     ip.ip.replace(
          //       /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/,
          //       (_, p1, _p2, _p3, p4) => `${p1}.****.${p4}`,
          //     ),
          //   );

          const validIps = server.availableIps
            ?.filter((ip) => !ip.wentSpam)
            ?.map((ip) => ip.ip);

          // If there are valid IPs, add them to the response
          if (validIps?.length > 0) {
            domainIp[hostKey] = validIps;
          }
        }
      });
      console.log('🚀 ~ EmailService ~ getAvailableIps ~ domainIp:', domainIp);
      return {
        message: 'Available domain and Ips',
        success: true,
        domainIp,
      };
    } catch (error: any) {
      console.log('🚀 ~ EmailService ~ create ~ error:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
