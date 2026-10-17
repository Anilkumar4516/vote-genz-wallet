import { Module } from '@nestjs/common';
import { TallyController } from './tally.controller';
import { TallyService } from './tally.service';
import { TallyVerificationService } from './tally-verification.service';
import { CryptoModule } from '../crypto/crypto.module';
import { RegistryDataSource } from '../../database/registry.datasource';
import { BallotBoxDataSource } from '../../database/ballotbox.datasource';

@Module({
  imports: [CryptoModule],
  controllers: [TallyController],
  providers: [
    TallyService,
    TallyVerificationService,
    RegistryDataSource,
    BallotBoxDataSource,
  ],
  exports: [TallyService, TallyVerificationService],
})
export class TallyModule {}
