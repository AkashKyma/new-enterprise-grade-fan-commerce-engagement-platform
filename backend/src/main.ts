import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useLogger(new Logger());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  Logger.log(`Backend running on port ${port}`);
}
bootstrap();
