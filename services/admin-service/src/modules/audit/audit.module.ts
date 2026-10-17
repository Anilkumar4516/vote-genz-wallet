import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditWriterService } from './audit-writer.service';
import { AuditVerifierService } from './audit-verifier.service';

@Module({
  controllers: [AuditController],
  providers: [AuditWriterService, AuditVerifierService],
  exports: [AuditWriterService, AuditVerifierService],
})
export class AuditModule {}
