import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { RegistryDataSource } from './database/registry.datasource';
import { BallotBoxDataSource } from './database/ballotbox.datasource';
import { TokenModule } from './modules/token/token.module';
import { BallotModule } from './modules/ballot/ballot.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { TallyModule } from './modules/tally/tally.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { HealthModule } from './modules/health/health.module';
import { AuditClient } from './audit/audit-client';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    CryptoModule,
    TokenModule,
    BallotModule,
    ReceiptModule,
    CandidateModule,
    TallyModule,
    HealthModule,
  ],
  providers: [
    RegistryDataSource,
    BallotBoxDataSource,
    AuditClient,
    LoggingInterceptor,
    AuditInterceptor,
  ],
  exports: [RegistryDataSource, BallotBoxDataSource, AuditClient],
})
export class AppModule {}
