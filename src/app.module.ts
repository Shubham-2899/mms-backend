//app.module.ts
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
import { AuthModule } from './auth/auth.module';
import { RootController } from './root.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Email, EmailSchema } from './email/schemas/email.schemas';
import { User, UserSchema } from './user/schemas/user.schema';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(`${process.env.DB_CONNECTION_STRING}`),
    MailerModule.forRoot({
      transport: {
        host: `${process.env.MAILER_HOST}`,
        pool: true, // Connection pooling enabled
        secure: false, // Not using port 465
        port: 587,
        tls: {
          rejectUnauthorized: false, // Disable TLS verification (consider setting to true in production)
        },
        auth: {
          user: `${process.env.ROOT_MAIL_USER}`,
          pass: `${process.env.ROOT_MAIL_USER_PASSWORD}`,
        },
        logger: true, // Log SMTP actions
        // debug: true, // Enable debugging for troubleshooting
        maxConnections: 5, // Max 5 connections at a time
        maxMessages: 100, // Max 100 emails per connection
        rateLimit: 10, // Max 10 emails per second
        connectionTimeout: 2 * 60 * 1000, // 2 minutes connection timeout
        greetingTimeout: 30 * 1000, // 30 seconds greeting timeout
        socketTimeout: 5 * 60 * 1000, // 5 minutes socket timeout
      },
    }),
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Email.name, schema: EmailSchema },
      { name: User.name, schema: UserSchema },
    ]),
    // AuthModule,
    EmailModule,
    UrlModule,
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
