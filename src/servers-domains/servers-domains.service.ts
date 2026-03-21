import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServerDomain, ServerDomainDocument } from './schemas/server-domain.schema';
import { CreateServerDomainDto, IpEntryDto } from './dto/create-server-domain.dto';

@Injectable()
export class ServersDomainService {
  constructor(
    @InjectModel(ServerDomain.name)
    private serverDomainModel: Model<ServerDomainDocument>,
  ) {}

  async findByDomain(domain: string) {
    return this.serverDomainModel.findOne({ domain });
  }

  async create(dto: CreateServerDomainDto) {
    const existing = await this.serverDomainModel.findOne({ domain: dto.domain });
    if (existing) {
      throw new HttpException(
        `Domain "${dto.domain}" is already assigned to a server`,
        HttpStatus.CONFLICT,
      );
    }
    const created = await this.serverDomainModel.create(dto);
    return { message: 'Server-domain created', success: true, data: created };
  }

  async findAll() {
    const data = await this.serverDomainModel.find().sort({ createdAt: -1 });
    return { success: true, data };
  }

  async findOne(id: string) {
    const doc = await this.serverDomainModel.findById(id);
    if (!doc) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: doc };
  }

  async update(id: string, dto: Partial<CreateServerDomainDto>) {
    // If domain is being changed, ensure it's not taken by another record
    if (dto.domain) {
      const conflict = await this.serverDomainModel.findOne({
        domain: dto.domain,
        _id: { $ne: id },
      });
      if (conflict) {
        throw new HttpException(
          `Domain "${dto.domain}" is already assigned to another server`,
          HttpStatus.CONFLICT,
        );
      }
    }
    const updated = await this.serverDomainModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { message: 'Updated', success: true, data: updated };
  }

  async remove(id: string) {
    const deleted = await this.serverDomainModel.findByIdAndDelete(id);
    if (!deleted) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { message: 'Deleted', success: true };
  }

  // --- IP management ---

  async addIp(id: string, ipDto: IpEntryDto) {
    const doc = await this.serverDomainModel.findById(id);
    if (!doc) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const duplicate = doc.availableIps.find((e) => e.ip === ipDto.ip);
    if (duplicate) {
      throw new HttpException(`IP "${ipDto.ip}" already exists on this server`, HttpStatus.CONFLICT);
    }

    doc.availableIps.push({ wentSpam: false, ...ipDto });
    await doc.save();
    return { message: 'IP added', success: true, data: doc };
  }

  async updateIp(id: string, ip: string, updates: Partial<IpEntryDto>) {
    const doc = await this.serverDomainModel.findById(id);
    if (!doc) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const entry = doc.availableIps.find((e) => e.ip === ip);
    if (!entry) throw new HttpException(`IP "${ip}" not found`, HttpStatus.NOT_FOUND);

    Object.assign(entry, updates);
    await doc.save();
    return { message: 'IP updated', success: true, data: doc };
  }

  async removeIp(id: string, ip: string) {
    const doc = await this.serverDomainModel.findById(id);
    if (!doc) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const before = doc.availableIps.length;
    doc.availableIps = doc.availableIps.filter((e) => e.ip !== ip);
    if (doc.availableIps.length === before) {
      throw new HttpException(`IP "${ip}" not found`, HttpStatus.NOT_FOUND);
    }

    await doc.save();
    return { message: 'IP removed', success: true, data: doc };
  }

  async markIpSpam(id: string, ip: string, wentSpam: boolean) {
    return this.updateIp(id, ip, { wentSpam });
  }

  /** Returns all active server-domains formatted as the selectedIp dropdown format: "domain - ip" */
  async getSelectableIps() {
    const docs = await this.serverDomainModel.find({ status: 'active' });
    const options: { label: string; value: string }[] = [];

    for (const doc of docs) {
      for (const entry of doc.availableIps) {
        options.push({
          label: `${doc.domain} - ${entry.ip}`,
          value: `${doc.domain} - ${entry.ip}`,
        });
      }
    }

    return { success: true, data: options };
  }
}
