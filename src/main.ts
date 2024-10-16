import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BullmqDashboardService } from './bullmq-dashboard/bullmq-dashboard.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // Get BullMQ service instance to attach middleware
  const bullmqDashboardService = app.get(BullmqDashboardService);

  // Bind BullMQ middleware to the Nest app
  bullmqDashboardService.bindMiddleware(app);

  await app.listen(5000);
}
bootstrap();
