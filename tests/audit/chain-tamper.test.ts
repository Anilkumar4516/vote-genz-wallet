import * as crypto from 'crypto';

interface AuditBlock {
  id: number;
  eventType: string;
  actorId: string;
  action: string;
  metadata: Record<string, any>;
  timestamp: string;
  prevHash: string;
  hash: string;
}

function calculateBlockHash(
  id: number,
  eventType: string,
  actorId: string,
  action: string,
  metadata: Record<string, any>,
  timestamp: string,
  prevHash: string
): string {
  const content = `${id}:${eventType}:${actorId}:${action}:${JSON.stringify(metadata)}:${timestamp}:${prevHash}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifyAuditChain(chain: AuditBlock[]): { isValid: boolean; brokenAtIndex?: number; reason?: string } {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];

    // Check link to previous block
    if (i === 0) {
      if (block.prevHash !== '0'.repeat(64)) {
        return { isValid: false, brokenAtIndex: 0, reason: 'Invalid genesis prevHash' };
      }
    } else {
      const prevBlock = chain[i - 1];
      if (block.prevHash !== prevBlock.hash) {
        return {
          isValid: false,
          brokenAtIndex: i,
          reason: `prevHash mismatch at block ${i}: expected ${prevBlock.hash}, found ${block.prevHash}`,
        };
      }
    }

    // Verify cryptographic self-consistency
    const expectedHash = calculateBlockHash(
      block.id,
      block.eventType,
      block.actorId,
      block.action,
      block.metadata,
      block.timestamp,
      block.prevHash
    );

    if (block.hash !== expectedHash) {
      return {
        isValid: false,
        brokenAtIndex: i,
        reason: `Hash signature integrity failure at block ${i}`,
      };
    }
  }

  return { isValid: true };
}

describe('Audit Ledger Hash Chain Tamper-Evidence Tests', () => {
  it('Validates intact hash chain with 100% mathematical integrity', () => {
    const chain: AuditBlock[] = [];
    let prevHash = '0'.repeat(64);

    const events = [
      { type: 'GENESIS', actor: 'SYSTEM', action: 'Initialize Election Ledger' },
      { type: 'KEY_CEREMONY', actor: 'TRUSTEE_01', action: 'Submit Shamir Key Share #1' },
      { type: 'POLLS_OPEN', actor: 'CHIEF_COMMISSIONER', action: 'Official Polls Opened' },
      { type: 'TOKEN_BURN', actor: 'VOTING_ENGINE', action: 'Burned Vote Token #8912' },
      { type: 'POLLS_CLOSE', actor: 'CHIEF_COMMISSIONER', action: 'Official Polls Closed' },
    ];

    events.forEach((ev, idx) => {
      const ts = new Date(1776432000000 + idx * 60000).toISOString();
      const meta = { index: idx, electionId: 'elc_gen_2026' };
      const hash = calculateBlockHash(idx, ev.type, ev.actor, ev.action, meta, ts, prevHash);

      chain.push({
        id: idx,
        eventType: ev.type,
        actorId: ev.actor,
        action: ev.action,
        metadata: meta,
        timestamp: ts,
        prevHash,
        hash,
      });

      prevHash = hash;
    });

    const verificationResult = verifyAuditChain(chain);
    expect(verificationResult.isValid).toBe(true);
    expect(verificationResult.brokenAtIndex).toBeUndefined();
  });

  it('Immediately detects malicious database row modification and identifies tampered index', () => {
    const chain: AuditBlock[] = [];
    let prevHash = '0'.repeat(64);

    const events = [
      { type: 'GENESIS', actor: 'SYSTEM', action: 'Initialize Ledger' },
      { type: 'TOKEN_BURN', actor: 'ENGINE', action: 'Token Burn' },
      { type: 'AUDIT_EXPORT', actor: 'AUDITOR', action: 'Exported Verification Proofs' },
    ];

    events.forEach((ev, idx) => {
      const ts = new Date(1776432000000 + idx * 60000).toISOString();
      const meta = { index: idx };
      const hash = calculateBlockHash(idx, ev.type, ev.actor, ev.action, meta, ts, prevHash);

      chain.push({
        id: idx,
        eventType: ev.type,
        actorId: ev.actor,
        action: ev.action,
        metadata: meta,
        timestamp: ts,
        prevHash,
        hash,
      });

      prevHash = hash;
    });

    // SIMULATE MALICIOUS TAMPERING: Attacker alters row #1 action text
    chain[1].action = 'MALICIOUS_INJECTED_ACTION';

    const verificationResult = verifyAuditChain(chain);

    // Assert that tampering was immediately detected
    expect(verificationResult.isValid).toBe(false);
    expect(verificationResult.brokenAtIndex).toBe(1);
    expect(verificationResult.reason).toContain('Hash signature integrity failure at block 1');
  });
});
