import { Module } from '@nestjs/common';
import { FingerprintController } from './fingerprint.controller';
import { FingerprintService } from './fingerprint.service';
import { VerificationStateService } from './verification-state.service';
import { LockoutModule } from '../lockout/lockout.module';
import { RedisService } from '../redis/redis.service';
import { VoterRegistryService } from '../voter-registry/voter-registry.service';

@Module({
  imports: [LockoutModule],
  controllers: [FingerprintController],
  providers: [
    FingerprintService,
    VerificationStateService,
    RedisService,
    VoterRegistryService,
  ],
  exports: [FingerprintService, VerificationStateService],
})
export class BiometricModule {}
