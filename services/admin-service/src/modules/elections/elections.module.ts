import { Module } from '@nestjs/common';
import { ElectionsController } from './elections.controller';
import { ElectionsService } from './elections.service';
import { ElectionSchedulerService } from './election-scheduler.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ElectionsController],
  providers: [ElectionsService, ElectionSchedulerService],
  exports: [ElectionsService],
})
export class ElectionsModule {}
