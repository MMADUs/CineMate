import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { IdempotencyInterceptor } from './common/idempotency/idempotency.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppLoggingInterceptor } from './common/logging/app-logging.interceptor';

async function bootstrap() {
  // nest app
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Security middleware
  app.use(helmet());

  // Cookie parser
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    app.get(AppLoggingInterceptor),
    app.get(IdempotencyInterceptor),
    new TransformInterceptor(),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CineMate API')
    .setDescription('CineMate backend API documentation.')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'User JWT access token stored as an HttpOnly cookie.',
    })
    .addCookieAuth('admin_access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'admin_access_token',
      description: 'Admin JWT access token stored as an HttpOnly cookie.',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  // run on env PORT or 3000 as fallback
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
