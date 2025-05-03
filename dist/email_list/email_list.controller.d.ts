/// <reference types="multer" />
import { EmailListService } from './email_list.service';
export declare class EmailListController {
    private readonly emailListService;
    constructor(emailListService: EmailListService);
    addEmails(emails: string[]): Promise<string>;
    uploadCSV(file: Express.Multer.File): Promise<any>;
    getSuppressionList(page?: string, limit?: string, fromDate?: string, toDate?: string): Promise<{
        data: {
            email: any;
            date: any;
            domain: any;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
        success: boolean;
    }>;
}
