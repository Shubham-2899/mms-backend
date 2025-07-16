// bullmq-dashboard.module.ts
import { Module } from '@nestjs/common';
// import { BullmqDashboardController } from './bullmq-dashboard.controller';
import { BullmqDashboardService } from './bullmq-dashboard.service';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseService } from 'src/auth/firebase.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue(
      {
        name: 'email-queue',
      },
      {
        name: 'campaign-queue',
      },
    ),
  ],
  // controllers: [BullmqDashboardController],
  providers: [BullmqDashboardService],
})
export class BullmqDashboardModule {}
