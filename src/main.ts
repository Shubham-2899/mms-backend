import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Strip unknown properties from incoming requests
  //     forbidNonWhitelisted: true, // Throw an error if unknown properties are provided
  //     transform: true, // Automatically transform payloads to the expected types
  //   }),
  // );
  await app.listen(5000);
}
bootstrap();
