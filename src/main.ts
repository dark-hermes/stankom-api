import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app.module';
import { FileUrlInterceptor } from './common/interceptors/file-url.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const logger: Logger = app.get(Logger);

  app.useLogger(logger);

  const port = configService.get<number>('PORT') || 3000;
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV');
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS') || '';

  // Enable CORS
  app.enableCors({
    origin: allowedOrigins.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  // Cookie Parser
  if (!cookieSecret) {
    logger.warn('COOKIE_SECRET is not set. Using insecure cookie parser.');
    app.use(cookieParser());
  } else {
    app.use(cookieParser(cookieSecret));
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Global interceptor to normalize file URLs to absolute paths
  app.useGlobalInterceptors(new FileUrlInterceptor(configService));

  // Serve static uploaded files under /uploads and /api/uploads
  const uploadRoot = configService.get<string>('UPLOAD_DEST') || 'uploads';
  const uploadsPath = join(process.cwd(), uploadRoot);
  app.use(`/${uploadRoot}`, express.static(uploadsPath)); // backward compatibility
  app.use(`/api/${uploadRoot}`, express.static(uploadsPath)); // API-prefixed access

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Stankom API Documentation')
      .setDescription('API documentation for Stankom Landing Page')
      .setVersion('1.0')
      .addTag('api')
      .addCookieAuth('access_token', {
        type: 'http',
        in: 'Header',
        scheme: 'Bearer',
        description:
          'JWT Auth Token stored in an HttpOnly cookie (access_token)',
      })
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, documentFactory());

    logger.log(`API documentation available at /api-docs`);
  }

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`Running in ${nodeEnv} mode`);
}
void bootstrap();
