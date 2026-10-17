import { AuditAction, AuditLogEntry, AppendAuditLogDto } from '@vote-wallet/shared-types';
import { AuditClientConfig, QueuedAuditEvent, AuditBatchResult } from './types';

declare const process: any;

/**
 * AuditClient
 *
 * Lightweight, non-blocking client used across all Vote Wallet microservices
 * (Voting Service, Auth Service, Face Service, Worker) to append immutable,
 * hash-chained audit events to the Admin Service audit ledger.
 */
export class AuditClient {
  private readonly adminServiceUrl: string;
  private readonly serviceName: string;
  private readonly serviceToken?: string;
  private readonly bufferSize: number;
  private readonly flushIntervalMs: number;
  private readonly maxRetries: number;
  private readonly fallbackToConsole: boolean;
  private readonly fetch: typeof fetch;

  private queue: QueuedAuditEvent[] = [];
  private flushTimer: any = null;
  private isFlushing = false;
  private isClosed = false;

  constructor(config: AuditClientConfig) {
    this.adminServiceUrl = (
      config.adminServiceUrl ||
      process.env.ADMIN_SERVICE_URL ||
      'http://localhost:3002'
    ).replace(/\/$/, '');
    this.serviceName = config.serviceName;
    this.serviceToken = config.serviceToken || process.env.SERVICE_AUTH_TOKEN;
    this.bufferSize = config.bufferSize ?? 5000;
    this.flushIntervalMs = config.flushIntervalMs ?? 1500;
    this.maxRetries = config.maxRetries ?? 3;
    this.fallbackToConsole = config.fallbackToConsole ?? true;
    this.fetch = config.fetchFn ?? globalThis.fetch;

    this.startBackgroundFlush();
  }

  /**
   * Non-blocking audit log. Pushes the event to the in-memory queue.
   * Immediately returns to never block high-throughput voter transactions.
   */
  log(action: AuditAction | string, actor: string, details: Record<string, any> = {}): void {
    if (this.isClosed) {
      this.writeFallback({ action, actor, details: { ...details, service: this.serviceName } });
      return;
    }

    if (this.queue.length >= this.bufferSize) {
      const dropped = this.queue.shift();
      if (dropped && this.fallbackToConsole) {
        this.writeFallback(dropped.dto, 'QUEUE_OVERFLOW');
      }
    }

    this.queue.push({
      dto: {
        action,
        actor,
        details: {
          ...details,
          service: this.serviceName,
          timestamp: new Date().toISOString(),
        },
      },
      attempts: 0,
      enqueuedAt: Date.now(),
    });
  }

  /**
   * High-priority blocking dispatch. Immediately posts to the admin service
   * and awaits response. Recommended for key ceremony and election opening/closing.
   */
  async logImmediately(
    action: AuditAction | string,
    actor: string,
    details: Record<string, any> = {},
  ): Promise<AuditLogEntry | null> {
    const payload: AppendAuditLogDto = {
      action,
      actor,
      details: {
        ...details,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      return await this.sendSingleLog(payload);
    } catch (err: any) {
      if (this.fallbackToConsole) {
        this.writeFallback(payload, err.message);
      }
      return null;
    }
  }

  /**
   * Helper: Log voter actions (anonymized or keyed by hash)
   */
  logVoterEvent(action: AuditAction | string, voterHash: string, details: Record<string, any> = {}): void {
    this.log(action, `voter:${voterHash.slice(0, 16)}`, details);
  }

  /**
   * Helper: Log security alerts and anomalies
   */
  logSecurityAlert(action: AuditAction | string, actor: string, details: Record<string, any> = {}): void {
    this.log(action, actor, { ...details, alertLevel: 'SECURITY_ALERT' });
  }

  /**
   * Helper: Log administrator activities
   */
  logAdminAction(action: AuditAction | string, adminId: string, details: Record<string, any> = {}): void {
    this.log(action, `admin:${adminId}`, details);
  }

  /**
   * Flushes all currently queued audit records to the admin-service.
   */
  async flush(): Promise<AuditBatchResult> {
    if (this.isFlushing || this.queue.length === 0) {
      return { successCount: 0, failureCount: 0, errors: [] };
    }

    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = [];

    const result: AuditBatchResult = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    for (const item of batch) {
      try {
        await this.sendSingleLog(item.dto);
        result.successCount++;
      } catch (err: any) {
        item.attempts++;
        if (item.attempts < this.maxRetries) {
          this.queue.push(item);
        } else {
          result.failureCount++;
          result.errors.push(err);
          if (this.fallbackToConsole) {
            this.writeFallback(item.dto, err.message);
          }
        }
      }
    }

    this.isFlushing = false;
    return result;
  }

  /**
   * Gracefully shuts down the audit client, flushing remaining buffer.
   */
  async close(): Promise<void> {
    this.isClosed = true;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  /**
   * Returns current buffer length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  private startBackgroundFlush(): void {
    if (typeof setInterval === 'undefined') return;

    this.flushTimer = setInterval(() => {
      this.flush().catch((err) => {
        // Non-blocking catch to prevent unhandled rejections
        if (this.fallbackToConsole) {
          process.stderr.write(`[AuditClient Background Flush Error]: ${err.message}\n`);
        }
      });
    }, this.flushIntervalMs);

    // Unref timer so it does not keep Node process alive on exit
    if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
      this.flushTimer.unref();
    }
  }

  private async sendSingleLog(payload: AppendAuditLogDto): Promise<AuditLogEntry> {
    const url = `${this.adminServiceUrl}/audit/log`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Origin-Service': this.serviceName,
    };

    if (this.serviceToken) {
      headers['Authorization'] = `Bearer ${this.serviceToken}`;
    }

    const response = await this.fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Admin service responded with status ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as AuditLogEntry;
  }

  private writeFallback(payload: AppendAuditLogDto, reason?: string): void {
    const fallbackRecord = {
      _tag: 'AUDIT_FALLBACK_STDOUT',
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      reason: reason || 'FALLBACK_DISPATCH',
      payload,
    };
    process.stdout.write(`${JSON.stringify(fallbackRecord)}\n`);
  }
}

/**
 * Factory helper to instantiate singleton or scoped AuditClient
 */
export function createAuditClient(config: AuditClientConfig): AuditClient {
  return new AuditClient(config);
}
