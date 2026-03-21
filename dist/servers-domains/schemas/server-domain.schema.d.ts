import { Document } from 'mongoose';
export type ServerDomainDocument = ServerDomain & Document;
export type WarmingStatus = 'cold' | 'warming' | 'warmed';
export declare class IpEntry {
    ip: string;
    isMainIp: boolean;
    wentSpam: boolean;
    provider: string;
    warmingStatus: WarmingStatus;
}
export declare const IpEntrySchema: any;
export declare class ServerDomain {
    domain: string;
    availableIps: IpEntry[];
    status: string;
    notes: string;
}
export declare const ServerDomainSchema: any;
