import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    create(createEmailDto: CreateEmailDto, token: string): Promise<{
        message: string;
        success: boolean;
        failedEmails: any[];
        emailSent: number;
        jobId?: undefined;
    } | {
        message: string;
        success: boolean;
        jobId: string;
        failedEmails?: undefined;
        emailSent?: undefined;
    }>;
    getAvailableIps(token: string): Promise<any>;
}
