import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailList, EmailListSchema } from './schemas/email_list.schemas';
import { EmailListService } from './email_list.service';
import { EmailListController } from './email_list.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: EmailList.name, schema: EmailListSchema },
    ]),
  ],
  controllers: [EmailListController],
  providers: [EmailListService],
})
export class EmailListModule {}
