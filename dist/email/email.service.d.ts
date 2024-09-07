import { MailerService } from '@nestjs-modules/mailer';
import { CreateEmailDto } from './dto/create-email.dto';
export declare class EmailService {
    private readonly mailService;
    constructor(mailService: MailerService);
    create(createEmailDto: CreateEmailDto): Promise<{
        message: string;
    }>;
    sendMail(createEmailDto: CreateEmailDto): Promise<void>;
}
