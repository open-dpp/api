import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { EntityNotFoundErrorFilter } from './exceptions/exception.handler';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new EntityNotFoundErrorFilter());
  app.enableCors({
    origin: '*',
  });
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
