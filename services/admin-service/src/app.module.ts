import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { VotersModule } from './modules/voters/voters.module';
import { ElectionsModule } from './modules/elections/elections.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { KeyCeremonyModule } from './modules/key-ceremony/key-ceremony.module';
import { AuditModule } from './modules/audit/audit.module';
import { DataRetentionModule } from './modules/data-retention/data-retention.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminAuthModule,
    VotersModule,
    ElectionsModule,
    CandidatesModule,
    KeyCeremonyModule,
    AuditModule,
    DataRetentionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
