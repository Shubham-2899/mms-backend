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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import { TestAccountsService } from './test-accounts.service';
import { CreateTestAccountDto } from './dto/create-test-account.dto';
export declare class TestAccountsController {
    private readonly service;
    constructor(service: TestAccountsService);
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./schemas/test-account.schema").TestAccountDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./schemas/test-account.schema").TestAccountDocument, {}> & import("./schemas/test-account.schema").TestAccount & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("./schemas/test-account.schema").TestAccountDocument, "find", {}>;
    create(dto: CreateTestAccountDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/test-account.schema").TestAccountDocument, {}> & import("./schemas/test-account.schema").TestAccount & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: Partial<CreateTestAccountDto>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/test-account.schema").TestAccountDocument, {}> & import("./schemas/test-account.schema").TestAccount & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
