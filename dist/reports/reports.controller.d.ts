import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReports(page?: number, pageSize?: number): Promise<{
        reports: any[];
        page: number;
        pageSize: number;
        totalElements: number;
        message: string;
        success: boolean;
    }>;
}
