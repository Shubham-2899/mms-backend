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
import { HydratedDocument } from 'mongoose';
export type UrlDocument = HydratedDocument<Url>;
export declare class Url {
    shortId: string;
    redirectURL: string;
    offerId: string;
    domain: string;
    linkType: string;
    campaignId: string;
    visitHistory: Record<string, any>[];
    clickCount: number;
    openRate: number;
}
export declare const UrlSchema: import("mongoose").Schema<Url, import("mongoose").Model<Url, any, any, any, import("mongoose").Document<unknown, any, Url, any> & Url & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Url, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Url>, {}> & import("mongoose").FlatRecord<Url> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
