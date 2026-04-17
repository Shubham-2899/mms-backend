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
exports.TestAccountsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const test_account_schema_1 = require("./schemas/test-account.schema");
let TestAccountsService = class TestAccountsService {
    constructor(testAccountModel) {
        this.testAccountModel = testAccountModel;
    }
    findAll() {
        return this.testAccountModel.find().sort({ createdAt: -1 }).lean();
    }
    create(dto) {
        return this.testAccountModel.create(dto);
    }
    async update(id, dto) {
        const doc = await this.testAccountModel.findByIdAndUpdate(id, dto, { new: true });
        if (!doc)
            throw new common_1.NotFoundException('Test account not found');
        return doc;
    }
    async remove(id) {
        const doc = await this.testAccountModel.findByIdAndDelete(id);
        if (!doc)
            throw new common_1.NotFoundException('Test account not found');
        return { success: true };
    }
};
exports.TestAccountsService = TestAccountsService;
exports.TestAccountsService = TestAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(test_account_schema_1.TestAccount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TestAccountsService);
//# sourceMappingURL=test-accounts.service.js.map