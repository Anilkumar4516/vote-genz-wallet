import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { VoterRegistryService } from './modules/voter-registry/voter-registry.service';
import { RedisService } from './modules/redis/redis.service';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { SessionModule } from './modules/session/session.module';
import { VoterModule } from './modules/voter/voter.module';
import { BiometricModule } from './modules/biometric/biometric.module';
import { LockoutModule } from './modules/lockout/lockout.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    AuthModule,
    OtpModule,
    SessionModule,
    VoterModule,
    BiometricModule,
    LockoutModule,
  ],
  controllers: [HealthController],
  providers: [VoterRegistryService, RedisService],
  exports: [VoterRegistryService, RedisService],
})
export class AppModule {}
