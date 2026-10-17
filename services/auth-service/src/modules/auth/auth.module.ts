import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VoterRegistryService } from '../voter-registry/voter-registry.service';
import { OtpModule } from '../otp/otp.module';
import { SessionModule } from '../session/session.module';
import { LockoutModule } from '../lockout/lockout.module';
import { BiometricModule } from '../biometric/biometric.module';

@Module({
  imports: [OtpModule, SessionModule, LockoutModule, BiometricModule],
  controllers: [AuthController],
  providers: [AuthService, VoterRegistryService],
  exports: [AuthService],
})
export class AuthModule {}
