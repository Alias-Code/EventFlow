import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT || 3005;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[stats-service] listening on port ${port}`);
}

bootstrap();

