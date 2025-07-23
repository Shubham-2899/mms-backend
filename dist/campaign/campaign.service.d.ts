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
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { CampaignDocument, CampaignEmailTrackingDocument } from './schemas/campaign.schemas';
import { EmailDocument } from 'src/email/schemas/email.schemas';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { FirebaseService } from 'src/auth/firebase.service';
import { UserDocument } from 'src/user/schemas/user.schema';
export declare class CampaignService {
    private campaignQueue;
    private emailQueue;
    private campaignModel;
    private emailTrackingModel;
    private emailModel;
    private userModel;
    private firebaseService;
    constructor(campaignQueue: Queue, emailQueue: Queue, campaignModel: Model<CampaignDocument>, emailTrackingModel: Model<CampaignEmailTrackingDocument>, emailModel: Model<EmailDocument>, userModel: Model<UserDocument>, firebaseService: FirebaseService);
    private fetchSmtpDetails;
    createCampaign(createCampaignDto: CreateCampaignDto, firebaseToken: string): Promise<{
        message: string;
        success: boolean;
        sent: string[];
        failed: string[];
        emailSent: number;
        emailFailed: number;
    } | {
        message: string;
        success: boolean;
        jobId: string;
    }>;
    startCampaign(createCampaignDto: CreateCampaignDto, smtpConfig: any): Promise<{
        message: string;
        success: boolean;
        jobId: string;
    }>;
    pauseCampaign(campaignId: string): Promise<{
        message: string;
        success: boolean;
    }>;
    resumeCampaign(createCampaignDto: CreateCampaignDto, smtpConfig: any): Promise<{
        message: string;
        success: boolean;
        jobId: string;
    }>;
    resumeCampaignWithToken(createCampaignDto: CreateCampaignDto, firebaseToken: string): Promise<{
        message: string;
        success: boolean;
        jobId: string;
    }>;
    testEmails(createCampaignDto: CreateCampaignDto, smtpConfig: any): Promise<{
        message: string;
        success: boolean;
        sent: string[];
        failed: string[];
        emailSent: number;
        emailFailed: number;
    }>;
    getCampaignStats(campaignId: string): Promise<{
        campaignId: string;
        status: string;
        counts: {
            sent: any;
            failed: any;
            pending: number;
            total: any;
        };
        campaign: {
            from: string;
            fromName: string;
            subject: string;
            offerId: string;
            selectedIp: string;
            batchSize: number;
            templateType: string;
            emailTemplate: string;
            delay: number;
            startedAt: Date;
            completedAt: Date;
            totalEmails: any;
            sentEmails: any;
            failedEmails: any;
            pendingEmails: number;
        };
    }>;
    getAllCampaigns(): Promise<{
        stats: {
            sent: any;
            failed: any;
            pending: number;
            total: any;
        };
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
        _id: unknown;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove";
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection<import("bson").Document>;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: unknown;
        }>, {}> & import("mongoose").FlatRecord<{
            [x: string]: unknown;
        }> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }>;
        __v: number;
    }[]>;
    stopJob(jobId: string): Promise<{
        message: string;
        success: boolean;
    }>;
    cleanupCampaignData(campaignId: string): Promise<{
        message: string;
        success: boolean;
        deletedCount: number;
    }>;
    getCampaignCleanupStatus(campaignId: string): Promise<{
        campaignId: string;
        status: string;
        trackingDataCount: number;
        needsCleanup: boolean;
    }>;
    endCampaign(campaignId: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
