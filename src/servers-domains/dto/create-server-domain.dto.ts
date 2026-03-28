export class IpEntryDto {
  ip: string;
  isMainIp: boolean;
  wentSpam?: boolean;
  provider: string;
  /** Defaults to 'cold' on creation. Promote to 'warming' then 'warmed' manually. */
  warmingStatus?: 'cold' | 'warming' | 'warmed';
}

export class CreateServerDomainDto {
  domain: string;
  availableIps: IpEntryDto[];
  status?: 'active' | 'inactive';
  notes?: string;
}
