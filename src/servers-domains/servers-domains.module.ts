import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerDomain, ServerDomainSchema } from './schemas/server-domain.schema';
import { ServersDomainController } from './servers-domains.controller';
import { ServersDomainService } from './servers-domains.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ServerDomain.name, schema: ServerDomainSchema },
    ]),
  ],
  controllers: [ServersDomainController],
  providers: [ServersDomainService],
  exports: [ServersDomainService, MongooseModule],
})
export class ServersDomainModule {}
