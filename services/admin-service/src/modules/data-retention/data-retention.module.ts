import { Module } from '@nestjs/common';
import { FaceTemplatePurgeService } from './face-template-purge.service';
import { AuditModule } from '../audit/audit.module';
import { VotersModule } from '../voters/voters.module';

@Module({
  imports: [AuditModule, VotersModule],
  providers: [FaceTemplatePurgeService],
  exports: [FaceTemplatePurgeService],
})
export class DataRetentionModule {}
