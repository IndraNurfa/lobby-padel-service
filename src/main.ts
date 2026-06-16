/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger();
  const nodeEnv = process.env.NODE_ENV || 'development';
  let options;

  if (nodeEnv === 'development') {
    options = { logger: true }; // Enable default logger
  } else {
    options = {
      logger: new ConsoleLogger({
        colors: false,
      }),
    }; // Disable logger color in production
  }

  const app = await NestFactory.create(AppModule, options);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
