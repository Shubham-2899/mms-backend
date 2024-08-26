import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  async create(createEmailDto: CreateEmailDto) {
    await this.sendMail(createEmailDto);
    return {
      message: 'Email processed successfully',
    };
  }

  async sendMail(createEmailDto: CreateEmailDto) {
    const { from, to: emailToUsers, templateType, mode } = createEmailDto;
    let { emailTemplate } = createEmailDto;

    emailTemplate = decodeURIComponent(emailTemplate);

    try {
      for (const userEmail of emailToUsers) {
        console.log(`sending email to ${userEmail}`);
        await this.mailService.sendMail({
          from: from,
          to: userEmail,
          subject: mode === 'test' ? `Test Email` : 'Marketing Email',
          html: templateType === 'html' ? emailTemplate : null,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}
