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
export type ServerDomainDocument = ServerDomain & Document;
export declare class IpEntry {
    ip: string;
    isMainIp: boolean;
    wentSpam: boolean;
    provider: string;
}
export declare const IpEntrySchema: import("mongoose").Schema<IpEntry, import("mongoose").Model<IpEntry, any, any, any, Document<unknown, any, IpEntry, any> & IpEntry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IpEntry, Document<unknown, {}, import("mongoose").FlatRecord<IpEntry>, {}> & import("mongoose").FlatRecord<IpEntry> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ServerDomain {
    domain: string;
    availableIps: IpEntry[];
    status: string;
    notes: string;
}
export declare const ServerDomainSchema: import("mongoose").Schema<ServerDomain, import("mongoose").Model<ServerDomain, any, any, any, Document<unknown, any, ServerDomain, any> & ServerDomain & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ServerDomain, Document<unknown, {}, import("mongoose").FlatRecord<ServerDomain>, {}> & import("mongoose").FlatRecord<ServerDomain> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
