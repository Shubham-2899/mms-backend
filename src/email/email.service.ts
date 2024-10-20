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
      const smtpConfig = await this.fetchSmtpDetails(res.uid);
      // console.log('🚀 ~ EmailService ~ create ~ smtpConfig:', smtpConfig);

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
        } = createEmailDto;
        const transporter = createTransporter(smtpConfig);
        emailTemplate = decodeURIComponent(emailTemplate);

        try {
          for (const userEmail of to) {
            console.log(`Sending email to ${userEmail}`);

            // Send the email using user's SMTP configuration
            const info = await transporter.sendMail({
              from: `${fromName} <${from}>`,
              to: userEmail,
              subject: subject,
              html: templateType === 'html' ? emailTemplate : emailTemplate,
            });

            console.log('Email sent:', info.response);

            // Save email to database
            const emailRecord = new this.emailModel({
              from: from,
              to: userEmail,
              offerId: offerId,
              campaignId: campaignId,
              response: info.response,
              sentAt: new Date(),
            });

            await emailRecord.save();
          }

          return {
            message: 'Emails processed successfully.',
            success: true,
            emailSent: to.length,
          };
        } catch (e) {
          console.error(`Failed to send email: ${e.message}`);
          throw new Error(e.message);
        }
      } else {
        console.log('inside bulk mode');
        // Add job to BullMQ queue
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

      const parts = user?.serverData?.[0].host.split('.');

      const smtpConfig = {
        host: user?.serverData?.[0].host,
        ip: user?.serverData?.[0].ip,
        user: `admin@${parts.slice(1).join('.')}`,
      };

      return smtpConfig;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch SMTP details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
