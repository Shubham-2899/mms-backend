export class IpEntryDto {
  ip: string;
  isMainIp: boolean;
  wentSpam?: boolean;
  provider: string;
}

export class CreateServerDomainDto {
  domain: string;
  availableIps: IpEntryDto[];
  status?: 'active' | 'inactive';
  notes?: string;
}
