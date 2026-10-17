import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('AdminServiceBootstrap');
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

  // 3. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vote Wallet - Administrative Service API')
    .setDescription(
      'Electoral roll administration, TOTP MFA, Shamir 2-of-3 key ceremony, hash-chained audit verification, automatic election scheduler, and biometric data purging',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Elections & Administration')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port);

  logger.log(`🛡️ [admin-service] running on http://localhost:${port}`);
  logger.log(`📖 Swagger API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health check probe available at http://localhost:${port}/health`);
}

bootstrap();
