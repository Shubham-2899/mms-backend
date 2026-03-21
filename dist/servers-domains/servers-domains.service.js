"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersDomainService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const server_domain_schema_1 = require("./schemas/server-domain.schema");
let ServersDomainService = class ServersDomainService {
    constructor(serverDomainModel) {
        this.serverDomainModel = serverDomainModel;
    }
    async findByDomain(domain) {
        return this.serverDomainModel.findOne({ domain });
    }
    async create(dto) {
        const existing = await this.serverDomainModel.findOne({ domain: dto.domain });
        if (existing) {
            throw new common_1.HttpException(`Domain "${dto.domain}" is already assigned to a server`, common_1.HttpStatus.CONFLICT);
        }
        const created = await this.serverDomainModel.create(dto);
        return { message: 'Server-domain created', success: true, data: created };
    }
    async findAll() {
        const data = await this.serverDomainModel.find().sort({ createdAt: -1 });
        return { success: true, data };
    }
    async findOne(id) {
        const doc = await this.serverDomainModel.findById(id);
        if (!doc)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        return { success: true, data: doc };
    }
    async update(id, dto) {
        if (dto.domain) {
            const conflict = await this.serverDomainModel.findOne({
                domain: dto.domain,
                _id: { $ne: id },
            });
            if (conflict) {
                throw new common_1.HttpException(`Domain "${dto.domain}" is already assigned to another server`, common_1.HttpStatus.CONFLICT);
            }
        }
        const updated = await this.serverDomainModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        return { message: 'Updated', success: true, data: updated };
    }
    async remove(id) {
        const deleted = await this.serverDomainModel.findByIdAndDelete(id);
        if (!deleted)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        return { message: 'Deleted', success: true };
    }
    async addIp(id, ipDto) {
        const doc = await this.serverDomainModel.findById(id);
        if (!doc)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        const duplicate = doc.availableIps.find((e) => e.ip === ipDto.ip);
        if (duplicate) {
            throw new common_1.HttpException(`IP "${ipDto.ip}" already exists on this server`, common_1.HttpStatus.CONFLICT);
        }
        doc.availableIps.push({ wentSpam: false, ...ipDto });
        await doc.save();
        return { message: 'IP added', success: true, data: doc };
    }
    async updateIp(id, ip, updates) {
        const doc = await this.serverDomainModel.findById(id);
        if (!doc)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        const entry = doc.availableIps.find((e) => e.ip === ip);
        if (!entry)
            throw new common_1.HttpException(`IP "${ip}" not found`, common_1.HttpStatus.NOT_FOUND);
        Object.assign(entry, updates);
        await doc.save();
        return { message: 'IP updated', success: true, data: doc };
    }
    async removeIp(id, ip) {
        const doc = await this.serverDomainModel.findById(id);
        if (!doc)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        const before = doc.availableIps.length;
        doc.availableIps = doc.availableIps.filter((e) => e.ip !== ip);
        if (doc.availableIps.length === before) {
            throw new common_1.HttpException(`IP "${ip}" not found`, common_1.HttpStatus.NOT_FOUND);
        }
        await doc.save();
        return { message: 'IP removed', success: true, data: doc };
    }
    async markIpSpam(id, ip, wentSpam) {
        return this.updateIp(id, ip, { wentSpam });
    }
    async getSelectableIps() {
        const docs = await this.serverDomainModel.find({ status: 'active' });
        const options = [];
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
};
exports.ServersDomainService = ServersDomainService;
exports.ServersDomainService = ServersDomainService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(server_domain_schema_1.ServerDomain.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServersDomainService);
//# sourceMappingURL=servers-domains.service.js.map