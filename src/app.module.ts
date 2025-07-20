//app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { UrlModule } from './url/url.module';
import { Url, UrlSchema } from './url/schemas/url.schema';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Email, EmailSchema } from './email/schemas/email.schemas';
import { User, UserSchema } from './user/schemas/user.schema';
import { UserModule } from './user/user.module';
import {
  EmailList,
  EmailListSchema,
} from './email_list/schemas/email_list.schemas';
import { EmailListModule } from './email_list/email_list.module';
import { BullModule } from '@nestjs/bullmq';
import { BullmqDashboardModule } from './bullmq-dashboard/bullmq-dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { JobsModule } from './jobs/jobs.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(`${process.env.DB_CONNECTION_STRING}`),
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Email.name, schema: EmailSchema },
      { name: User.name, schema: UserSchema },
      { name: EmailList.name, schema: EmailListSchema },
    ]),
    // AuthModule,
    EmailModule,
    UrlModule,
    UserModule,
    EmailListModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        password: `${process.env.REDIS_PASSWORD}`,
      },
      defaultJobOptions: {
        removeOnComplete: { age: 7 * 24 * 60 * 60 },
        removeOnFail: { age: 7 * 24 * 60 * 60 },
      },
    }),

    // Define a queue for sending emails
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    BullmqDashboardModule,
    ReportsModule,
    JobsModule,
    CampaignModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
