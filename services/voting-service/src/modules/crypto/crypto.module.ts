import { Module } from '@nestjs/common';
import { KmsService } from './kms.service';
import { BallotEncryptionService } from './ballot-encryption.service';
import { KeyReleaseService } from './key-release.service';

@Module({
  providers: [KmsService, BallotEncryptionService, KeyReleaseService],
  exports: [KmsService, BallotEncryptionService, KeyReleaseService],
})
export class CryptoModule {}
