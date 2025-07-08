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
import { EmailDocument } from './schemas/email.schemas';
import { CreateEmailDto } from './dto/create-email.dto';
import { FirebaseService } from 'src/auth/firebase.service';
import { UserDocument } from 'src/user/schemas/user.schema';
export declare class EmailService {
    private emailQueue;
    private emailModel;
    private userModel;
    private firebaseService;
    constructor(emailQueue: Queue, emailModel: Model<EmailDocument>, userModel: Model<UserDocument>, firebaseService: FirebaseService);
    create(createEmailDto: CreateEmailDto, firebaseToken: string): Promise<{
        message: string;
        success: boolean;
        failedEmails: any[];
        emailSent: number;
        jobId?: undefined;
    } | {
        message: string;
        success: boolean;
        jobId: string;
        failedEmails?: undefined;
        emailSent?: undefined;
    }>;
    private fetchSmtpDetails;
    getAvailableIps(firebaseToken: string): Promise<any>;
}
