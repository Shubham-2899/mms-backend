import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter'; // For Bull v3
import { ExpressAdapter } from '@bull-board/express';
import * as express from 'express';
import { Queue } from 'bullmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Strip unknown properties from incoming requests
  //     forbidNonWhitelisted: true, // Throw an error if unknown properties are provided
  //     transform: true, // Automatically transform payloads to the expected types
  //   }),
  // );
  // const serverAdapter = new ExpressAdapter();
  // serverAdapter.setBasePath('/admin/queues');

  // const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  //   queues: [
  //     new BullAdapter(app.get<Queue>('BullQueue_email-queue')), // Replace 'email-queue' with your queue name
  //   ],
  //   serverAdapter,
  // });

  // app.use('/admin/queues', serverAdapter.getRouter());
  await app.listen(5000);
}
bootstrap();
