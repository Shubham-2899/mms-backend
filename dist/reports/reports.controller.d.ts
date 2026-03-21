import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReports(page?: number, pageSize?: number, offerId?: string, campaignId?: string, fromDate?: string, toDate?: string): Promise<{
        reports: any[];
        page: number;
        pageSize: number;
        totalElements: number;
        message: string;
        success: boolean;
    }>;
}
