/**
 * Hash-Chained Audit Ledger Types
 */

export type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_OTP_REQUESTED'
  | 'AUTH_OTP_VERIFIED'
  | 'AUTH_LOGOUT'
  | 'BIO_LIVENESS_CHECK'
  | 'BIO_FACE_VERIFIED'
  | 'BIO_FINGERPRINT_VERIFIED'
  | 'VOTE_TOKEN_ISSUED'
  | 'BALLOT_CAST'
  | 'ELECTION_CREATED'
  | 'ELECTION_STATUS_CHANGED'
  | 'KEY_CEREMONY_INITIATED'
  | 'KEY_CEREMONY_SHARE_SUBMITTED'
  | 'KEY_CEREMONY_COMPLETED'
  | 'TALLY_GENERATED'
  | 'VOTERS_BULK_IMPORTED'
  | 'BIO_TEMPLATES_PURGED'
  | 'ADMIN_ACCESS';

export interface AuditLogEntry {
  id: string;
  action: AuditAction | string;
  actor: string;
  details: Record<string, any>;
  previousHash: string;
  currentHash: string;
  timestamp: string | Date;
}

export interface AppendAuditLogDto {
  action: AuditAction | string;
  actor: string;
  details?: Record<string, any>;
}

export interface AuditChainVerificationResult {
  isValid: boolean;
  totalEntries: number;
  corruptedIndex?: number;
  corruptedHash?: string;
  expectedHash?: string;
  genesisHash: string;
  lastHash: string;
  verifiedAt: string;
}
