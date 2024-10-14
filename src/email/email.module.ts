import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './schemas/email.schemas';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './email.processor';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule,
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    AuthModule,
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor],
})
export class EmailModule {}
