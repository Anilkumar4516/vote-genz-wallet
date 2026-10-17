import { AuditAction, AuditLogEntry, AppendAuditLogDto } from '@vote-wallet/shared-types';

export interface AuditClientConfig {
  /** Base URL of the admin-service audit endpoint (e.g. http://localhost:3002 or http://admin-service:3002) */
  adminServiceUrl?: string;
  /** Service identifier sending the audit event (e.g. voting-service, auth-service, face-service) */
  serviceName: string;
  /** Inter-service authentication token or bearer token */
  serviceToken?: string;
  /** Max records queued in memory before dropping oldest (default: 5000) */
  bufferSize?: number;
  /** Interval in ms to flush pending batch to admin-service (default: 1500ms) */
  flushIntervalMs?: number;
  /** Maximum retry attempts for failed HTTP dispatches (default: 3) */
  maxRetries?: number;
  /** Fallback to structured stdout logger when admin-service is unreachable (default: true) */
  fallbackToConsole?: boolean;
  /** Optional custom fetch implementation (defaults to global fetch) */
  fetchFn?: typeof fetch;
}

export interface QueuedAuditEvent {
  dto: AppendAuditLogDto;
  attempts: number;
  enqueuedAt: number;
}

export interface AuditBatchResult {
  successCount: number;
  failureCount: number;
  errors: Error[];
}
