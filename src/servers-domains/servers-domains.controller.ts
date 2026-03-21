import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ServersDomainService } from './servers-domains.service';
import { CreateServerDomainDto, IpEntryDto } from './dto/create-server-domain.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';

@UseGuards(FirebaseAuthGuard)
@UseGuards(AdminAuthGuard)
@Controller('/api/servers-domains')
export class ServersDomainController {
  constructor(private readonly service: ServersDomainService) {}

  @Post()
  create(@Body() dto: CreateServerDomainDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** Returns selectable "domain - ip" options for campaign dropdowns */
  @Get('selectable-ips')
  getSelectableIps() {
    return this.service.getSelectableIps();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateServerDomainDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // --- IP sub-routes ---

  @Post(':id/ips')
  addIp(@Param('id') id: string, @Body() ipDto: IpEntryDto) {
    return this.service.addIp(id, ipDto);
  }

  @Put(':id/ips/:ip')
  updateIp(
    @Param('id') id: string,
    @Param('ip') ip: string,
    @Body() updates: Partial<IpEntryDto>,
  ) {
    return this.service.updateIp(id, ip, updates);
  }

  @Delete(':id/ips/:ip')
  removeIp(@Param('id') id: string, @Param('ip') ip: string) {
    return this.service.removeIp(id, ip);
  }

  @Patch(':id/ips/:ip/spam')
  markSpam(
    @Param('id') id: string,
    @Param('ip') ip: string,
    @Body('wentSpam') wentSpam: boolean,
  ) {
    return this.service.markIpSpam(id, ip, wentSpam);
  }
}
