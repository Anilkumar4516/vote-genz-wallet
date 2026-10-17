import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AuditEvent {
  action: string;
  actor: string;
  outcome: 'SUCCESS' | 'FAILURE';
  durationMs: number;
  details?: Record<string, any>;
}

@Injectable()
export class AuditClient {
  private readonly logger = new Logger(AuditClient.name);
  private auditUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.auditUrl = this.configService.get<string>('security.adminAuditServiceUrl') || 'http://localhost:3003/admin/audit-log';
  }

  async sendAuditEvent(event: AuditEvent): Promise<void> {
    const payload = {
      service: 'voting-service',
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Asynchronously dispatch to admin audit service without blocking critical voting thread
    try {
      if (typeof fetch !== 'undefined') {
        fetch(this.auditUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch((err) => {
          this.logger.debug(`Audit service unreachable (logged locally): ${err.message}`);
        });
      }
    } catch {
      // Local graceful fallback
    }

    this.logger.log(`📋 [Audit Log] ${event.outcome} ${event.action} by ${event.actor} in ${event.durationMs}ms`);
  }
}
