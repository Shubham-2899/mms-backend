import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { UrlModule } from './url/url.module';
import { Url, UrlSchema } from './url/schemas/url.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(`${process.env.DB_CONNECTION_STRING}`),
    MailerModule.forRoot({
      transport: {
        host: `${process.env.MAILER_HOST}`,
        secure: false,
        port: 587,
        tls: {
          rejectUnauthorized: false, // Disable TLS verification
        },
        auth: {
          user: `${process.env.ROOT_MAIL_USER}`,
          pass: `${process.env.ROOT_MAIL_USER_PASSWORD}`,
        },
        logger: true,
        debug: true,
      },
    }),
    MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]),
    EmailModule,
    UrlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
