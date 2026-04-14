import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestAccount, TestAccountDocument } from './schemas/test-account.schema';
import { CreateTestAccountDto } from './dto/create-test-account.dto';

@Injectable()
export class TestAccountsService {
  constructor(
    @InjectModel(TestAccount.name)
    private testAccountModel: Model<TestAccountDocument>,
  ) {}

  findAll() {
    return this.testAccountModel.find().sort({ createdAt: -1 }).lean();
  }

  create(dto: CreateTestAccountDto) {
    return this.testAccountModel.create(dto);
  }

  async update(id: string, dto: Partial<CreateTestAccountDto>) {
    const doc = await this.testAccountModel.findByIdAndUpdate(id, dto, { new: true });
    if (!doc) throw new NotFoundException('Test account not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.testAccountModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Test account not found');
    return { success: true };
  }
}
