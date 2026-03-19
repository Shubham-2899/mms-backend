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
import { ServerDomain, ServerDomainDocument } from './schemas/server-domain.schema';
import { CreateServerDomainDto, IpEntryDto } from './dto/create-server-domain.dto';
export declare class ServersDomainService {
    private serverDomainModel;
    constructor(serverDomainModel: Model<ServerDomainDocument>);
    create(dto: CreateServerDomainDto): Promise<{
        message: string;
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    update(id: string, dto: Partial<CreateServerDomainDto>): Promise<{
        message: string;
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
        success: boolean;
    }>;
    addIp(id: string, ipDto: IpEntryDto): Promise<{
        message: string;
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    updateIp(id: string, ip: string, updates: Partial<IpEntryDto>): Promise<{
        message: string;
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    removeIp(id: string, ip: string): Promise<{
        message: string;
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    markIpSpam(id: string, ip: string, wentSpam: boolean): Promise<{
        message: string;
        success: boolean;
        data: import("mongoose").Document<unknown, {}, ServerDomainDocument, {}> & ServerDomain & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    getSelectableIps(): Promise<{
        success: boolean;
        data: {
            label: string;
            value: string;
        }[];
    }>;
}
