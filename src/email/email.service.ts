import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schemas/email.schemas';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {}

  async create(createEmailDto: CreateEmailDto) {
    try {
      await this.sendMail(createEmailDto);
      return {
        message: 'Emails processed and saved successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendMail(createEmailDto: CreateEmailDto) {
    const {
      from,
      to: emailToUsers,
      templateType,
      mode,
      fromName,
      subject,
    } = createEmailDto;
    let { emailTemplate } = createEmailDto;

    emailTemplate = decodeURIComponent(emailTemplate);

    try {
      for (const userEmail of emailToUsers) {
        console.log(`Sending email to ${userEmail}`);

        // Send the email
        const info = await this.mailService.sendMail({
          from: `${fromName} <${from}>`,
          to: userEmail,
          subject: subject,
          html: templateType === 'html' ? emailTemplate : emailTemplate, // need to update this line
        });
        console.log('🚀 ~ EmailService ~ sendMail ~ info:', info);

        // Save the email to the database after it is successfully sent
        const emailRecord = new this.emailModel({
          from: createEmailDto.from,
          to: userEmail,
          offerId: createEmailDto.offerId,
          response: info.response,
          sentAt: new Date(),
        });
        await emailRecord.save();
      }
    } catch (e) {
      console.error(
        `Failed to send email to one or more recipients: ${e.message}`,
      );
      throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
    }
  }
}
