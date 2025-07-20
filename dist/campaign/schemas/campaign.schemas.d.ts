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
import { Document } from 'mongoose';
export type CampaignDocument = Campaign & Document;
export type CampaignEmailTrackingDocument = CampaignEmailTracking & Document;
export declare class Campaign {
    campaignId: string;
    status: string;
    from: string;
    fromName: string;
    subject: string;
    templateType: string;
    emailTemplate: string;
    offerId: string;
    selectedIp: string;
    batchSize: number;
    delay: number;
    jobId?: string;
    startedAt?: Date;
    completedAt?: Date;
    pendingEmails?: number;
    totalEmails?: number;
    sentEmails?: number;
    failedEmails?: number;
}
export declare class CampaignEmailTracking {
    to_email: string;
    campaignId: string;
    status: string;
    isProcessed: boolean;
    sentAt?: Date;
    errorMessage?: string;
}
export declare const CampaignSchema: import("mongoose").Schema<Campaign, import("mongoose").Model<Campaign, any, any, any, Document<unknown, any, Campaign, any> & Campaign & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Campaign, Document<unknown, {}, import("mongoose").FlatRecord<Campaign>, {}> & import("mongoose").FlatRecord<Campaign> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const CampaignEmailTrackingSchema: import("mongoose").Schema<CampaignEmailTracking, import("mongoose").Model<CampaignEmailTracking, any, any, any, Document<unknown, any, CampaignEmailTracking, any> & CampaignEmailTracking & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CampaignEmailTracking, Document<unknown, {}, import("mongoose").FlatRecord<CampaignEmailTracking>, {}> & import("mongoose").FlatRecord<CampaignEmailTracking> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
