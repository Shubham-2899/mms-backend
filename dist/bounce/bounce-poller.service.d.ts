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
import { BouncedEmailDocument } from './schemas/bounced-email.schema';
import { ServerDomainDocument } from 'src/servers-domains/schemas/server-domain.schema';
export declare class BouncePollerService {
    private bouncedEmailModel;
    private serverDomainModel;
    private readonly logger;
    private readonly HARD_BOUNCE_PATTERN;
    private readonly SOFT_BOUNCE_PATTERN;
    constructor(bouncedEmailModel: Model<BouncedEmailDocument>, serverDomainModel: Model<ServerDomainDocument>);
    pollAllDomains(): Promise<void>;
    pollDomain(domain: string): Promise<{
        processed: number;
        errors: number;
    }>;
    private processNdr;
    private extractFailedEmail;
    private extractBounceInfo;
    isHardBounce(email: string): Promise<boolean>;
    filterHardBounces(emails: string[]): Promise<Set<string>>;
}
