import * as crypto from 'crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function computeAuditHash(
  previousHash: string,
  action: string,
  actor: string,
  details: Record<string, any>,
  timestamp: string | Date,
): string {
  const normalizedTime = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
  const sortedDetails = JSON.stringify(details, Object.keys(details).sort());
  const payload = `${previousHash}|${action}|${actor}|${sortedDetails}|${normalizedTime}`;

  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}
