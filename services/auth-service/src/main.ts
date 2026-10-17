import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('AuthServiceBootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Production Security Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors();

  // 2. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 3. Centralized Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 4. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vote Wallet - Authentication Microservice API')
    .setDescription(
      'Multi-factor citizen authentication, OTP dispatch (MSG91/Twilio), short-lived JWT & Redis sessions, biometric device signature verification, and 3-strike lockout protection',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication & Biometrics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🔐 [auth-service] running on http://localhost:${port}`);
  logger.log(`📖 Swagger API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health check probe available at http://localhost:${port}/health`);
}

bootstrap();
