/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import { Model } from 'mongoose';
import { CampaignEmailTrackingDocument } from '../campaign/schemas/campaign.schemas';
import { EmailListDocument } from './schemas/email_list.schemas';
import { CampaignDocument } from '../campaign/schemas/campaign.schemas';
export declare class EmailListService {
    private campaignEmailTrackingModel;
    private emailListModel;
    private campaignModel;
    constructor(campaignEmailTrackingModel: Model<CampaignEmailTrackingDocument>, emailListModel: Model<EmailListDocument>, campaignModel: Model<CampaignDocument>);
    private emailRegex;
    addEmails(emailArray: string[], campaignId: string): Promise<any>;
    private updateCampaignAfterEmailUpload;
    addEmailsFromCSVFile(filePath: string, campaignId: string): Promise<void>;
    getSuppressionList(page?: number, limit?: number, fromDate?: string, toDate?: string): Promise<{
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
    }>;
}
