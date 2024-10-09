/// <reference types="multer" />
import { EmailListService } from './email_list.service';
export declare class EmailListController {
    private readonly emailListService;
    constructor(emailListService: EmailListService);
    addEmails(emails: string[]): Promise<string>;
    uploadCSV(file: Express.Multer.File): Promise<any>;
}
