import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TestAccountsService } from './test-accounts.service';
import { CreateTestAccountDto } from './dto/create-test-account.dto';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('/api/test-accounts')
export class TestAccountsController {
  constructor(private readonly service: TestAccountsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateTestAccountDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTestAccountDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
