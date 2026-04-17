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
import { TestAccount, TestAccountDocument } from './schemas/test-account.schema';
import { CreateTestAccountDto } from './dto/create-test-account.dto';
export declare class TestAccountsService {
    private testAccountModel;
    constructor(testAccountModel: Model<TestAccountDocument>);
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<TestAccountDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, TestAccountDocument, {}> & TestAccount & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, TestAccountDocument, "find", {}>;
    create(dto: CreateTestAccountDto): Promise<import("mongoose").Document<unknown, {}, TestAccountDocument, {}> & TestAccount & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: Partial<CreateTestAccountDto>): Promise<import("mongoose").Document<unknown, {}, TestAccountDocument, {}> & TestAccount & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
