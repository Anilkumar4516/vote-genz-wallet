import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuditVerifierService } from './audit-verifier.service';
import { AuditWriterService } from './audit-writer.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class AppendAuditLogDto {
  action: string;
  actor: string;
  details?: Record<string, any>;
}

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditVerifier: AuditVerifierService,
    private readonly auditWriter: AuditWriterService,
  ) {}

  @Get('verify-chain')
  @UseGuards(RolesGuard)
  @Roles('AUDITOR', 'ADMIN')
  async verifyChain() {
    return this.auditVerifier.verifyChain();
  }

  @Post('log')
  @HttpCode(HttpStatus.OK)
  async appendLog(@Body() body: AppendAuditLogDto) {
    return this.auditWriter.appendLog(body.action, body.actor, body.details || {});
  }

  @Get('chain')
  @UseGuards(RolesGuard)
  @Roles('AUDITOR', 'ADMIN')
  async getChain() {
    return this.auditWriter.getChain();
  }
}
