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
import { BouncePollerService } from './bounce-poller.service';
import { Model } from 'mongoose';
import { BouncedEmailDocument } from './schemas/bounced-email.schema';
export declare class BounceController {
    private readonly bouncePollerService;
    private bouncedEmailModel;
    constructor(bouncePollerService: BouncePollerService, bouncedEmailModel: Model<BouncedEmailDocument>);
    list(domain?: string, bounceType?: 'hard' | 'soft', page?: string, limit?: string): Promise<{
        success: boolean;
        data: (import("mongoose").FlattenMaps<BouncedEmailDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    pollDomain(domain: string): Promise<{
        processed: number;
        errors: number;
        success: boolean;
    }>;
    pollAll(): Promise<{
        success: boolean;
        message: string;
    }>;
    checkEmails(body: {
        emails: string[];
    }): Promise<{
        success: boolean;
        message: string;
        hardBounced?: undefined;
        count?: undefined;
    } | {
        success: boolean;
        hardBounced: string[];
        count: number;
        message?: undefined;
    }>;
    remove(email: string): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
}
