/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Lobby Padel API')
    .setDescription(
      'Lobby Padel is a smart and seamless booking platform designed to make playing padel effortless. With just a few taps, players can find, book, and manage padel courts anytime, anywhere.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = 'api/docs';
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger docs available at: ${await app.getUrl()}/${swaggerPath}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
