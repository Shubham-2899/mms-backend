export declare class IpEntryDto {
    ip: string;
    isMainIp: boolean;
    wentSpam?: boolean;
    provider: string;
    warmingStatus?: 'cold' | 'warming' | 'warmed';
}
export declare class CreateServerDomainDto {
    domain: string;
    availableIps: IpEntryDto[];
    status?: 'active' | 'inactive';
    notes?: string;
}
