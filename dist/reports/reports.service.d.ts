import { Model } from 'mongoose';
import { EmailDocument } from 'src/email/schemas/email.schemas';
import { UrlDocument } from 'src/url/schemas/url.schema';
export declare class ReportsService {
    private readonly urlModel;
    private readonly emailModel;
    constructor(urlModel: Model<UrlDocument>, emailModel: Model<EmailDocument>);
    getReports(page: number, pageSize: number, offerId?: string, campaignId?: string, fromDate?: string, toDate?: string): unknown;
}
