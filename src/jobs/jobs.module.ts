import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
