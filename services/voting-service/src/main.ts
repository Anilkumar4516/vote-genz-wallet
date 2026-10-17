import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

async function bootstrap() {
  const logger = new Logger('VotingServiceBootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Production Security Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI to render smoothly
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

  // 3. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Global Interceptors (Logging & Auditing)
  app.useGlobalInterceptors(
    app.get(LoggingInterceptor),
    app.get(AuditInterceptor),
  );

  // 5. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vote Wallet - Voting Microservice API')
    .setDescription(
      'Enterprise zero-knowledge ballot box sealing, blind token issuance, dual-database isolation, AES-256-GCM encryption, and Merkle tally verification',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Voting & Ballot Box')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);

  logger.log(`🗳️ [voting-service] running on http://localhost:${port}`);
  logger.log(`📖 Swagger API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🩺 Liveness probe: http://localhost:${port}/health/live`);
  logger.log(`🩺 Readiness probe: http://localhost:${port}/health/ready`);
}

bootstrap();
