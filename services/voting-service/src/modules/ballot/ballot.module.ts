import { Module } from '@nestjs/common';
import { BallotController } from './ballot.controller';
import { BallotService } from './ballot.service';
import { BallotCastTransaction } from './ballot-cast.transaction';
import { TokenModule } from '../token/token.module';
import { CryptoModule } from '../crypto/crypto.module';
import { RegistryDataSource } from '../../database/registry.datasource';
import { BallotBoxDataSource } from '../../database/ballotbox.datasource';

@Module({
  imports: [TokenModule, CryptoModule],
  controllers: [BallotController],
  providers: [
    BallotService,
    BallotCastTransaction,
    RegistryDataSource,
    BallotBoxDataSource,
  ],
  exports: [BallotService, BallotCastTransaction],
})
export class BallotModule {}
