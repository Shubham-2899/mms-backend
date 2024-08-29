import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  async create(createEmailDto: CreateEmailDto) {
    try {
      await this.sendMail(createEmailDto);
      return {
        message: 'Email processed successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendMail(createEmailDto: CreateEmailDto) {
    const { from, to: emailToUsers, templateType, mode } = createEmailDto;
    let { emailTemplate } = createEmailDto;

    emailTemplate = decodeURIComponent(emailTemplate);

    try {
      for (const userEmail of emailToUsers) {
        console.log(`Sending email to ${userEmail}`);
        await this.mailService.sendMail({
          from,
          to: userEmail,
          subject: mode === 'test' ? 'Test Email' : 'Marketing Email',
          html: templateType === 'html' ? emailTemplate : null,
        });
      }
    } catch (e) {
      console.error(
        `Failed to send email to one or more recipients: ${e.message}`,
      );
      // Rethrow the error with additional context if necessary
      throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
    }
  }
}
