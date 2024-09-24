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
        pool: true,
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
        // debug: true,
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
