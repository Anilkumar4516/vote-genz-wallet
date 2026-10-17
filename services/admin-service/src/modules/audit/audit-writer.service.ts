import { Injectable, Logger } from '@nestjs/common';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';
import { computeAuditHash, GENESIS_HASH } from './hash-chain.util';
import * as crypto from 'crypto';

@Injectable()
export class AuditWriterService {
  private readonly logger = new Logger(AuditWriterService.name);
  private auditChain: AuditLogEntity[] = [];
  private lastHash: string = GENESIS_HASH;

  /**
   * Appends an audit log entry with strict hash-chaining (prev_hash and current_hash)
   */
  async appendLog(action: string, actor: string, details: Record<string, any> = {}): Promise<AuditLogEntity> {
    const timestamp = new Date();
    const id = 'aud_' + crypto.randomBytes(12).toString('hex');
    const previousHash = this.lastHash;
    const currentHash = computeAuditHash(previousHash, action, actor, details, timestamp);

    const entry: AuditLogEntity = {
      id,
      action,
      actor,
      details,
      previousHash,
      currentHash,
      timestamp,
    };

    this.auditChain.push(entry);
    this.lastHash = currentHash;

    this.logger.log(`📜 [Audit Append] ${action} by ${actor} (Hash: ${currentHash.slice(0, 10)}...)`);
    return entry;
  }

  getChain(): AuditLogEntity[] {
    return [...this.auditChain];
  }

  getLastHash(): string {
    return this.lastHash;
  }
}
