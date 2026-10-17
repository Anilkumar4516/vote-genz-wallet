import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditClient } from '../../audit/audit-client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditClient: AuditClient) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const startTime = Date.now();
    const action = `${method} ${url}`;
    const actor = headers['x-voter-hash'] || 'ANONYMOUS_OR_SERVICE';

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const durationMs = Date.now() - startTime;
          this.auditClient.sendAuditEvent({
            action,
            actor,
            outcome: 'SUCCESS',
            durationMs,
            details: {
              status: 'COMPLETED',
              hasReceipt: Boolean(responseBody?.receipt?.receiptCode),
            },
          });
        },
        error: (error) => {
          const durationMs = Date.now() - startTime;
          this.auditClient.sendAuditEvent({
            action,
            actor,
            outcome: 'FAILURE',
            durationMs,
            details: {
              errorMessage: error.message,
              errorCode: error.response?.code || 'UNKNOWN_ERROR',
            },
          });
        },
      }),
    );
  }
}
