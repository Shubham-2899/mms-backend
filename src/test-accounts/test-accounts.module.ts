import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestAccountsController } from './test-accounts.controller';
import { TestAccountsService } from './test-accounts.service';
import { TestAccount, TestAccountSchema } from './schemas/test-account.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestAccount.name, schema: TestAccountSchema }]),
    AuthModule,
  ],
  controllers: [TestAccountsController],
  providers: [TestAccountsService],
})
export class TestAccountsModule {}
