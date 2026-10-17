import { Injectable, Logger } from '@nestjs/common';
import { AuditWriterService } from './audit-writer.service';
import { computeAuditHash, GENESIS_HASH } from './hash-chain.util';

export interface ChainVerificationReport {
  isChainValid: boolean;
  totalRecordsChecked: number;
  genesisHash: string;
  headHash: string;
  tamperDetected: boolean;
  tamperedEntryIndex?: number;
  verifiedAt: string;
}

@Injectable()
export class AuditVerifierService {
  private readonly logger = new Logger(AuditVerifierService.name);

  constructor(private readonly auditWriter: AuditWriterService) {}

  /**
   * Recomputes the entire cryptographic hash chain from Genesis to Head.
   * Detects any altered details, deleted rows, or injected audit records.
   */
  async verifyChain(): Promise<ChainVerificationReport> {
    const chain = this.auditWriter.getChain();
    let expectedPreviousHash = GENESIS_HASH;

    for (let i = 0; i < chain.length; i++) {
      const entry = chain[i];

      // 1. Check previous hash link
      if (entry.previousHash !== expectedPreviousHash) {
        this.logger.error(`🚨 TAMPER DETECTED at index ${i}: Expected prevHash ${expectedPreviousHash}, found ${entry.previousHash}`);
        return {
          isChainValid: false,
          totalRecordsChecked: i,
          genesisHash: GENESIS_HASH,
          headHash: this.auditWriter.getLastHash(),
          tamperDetected: true,
          tamperedEntryIndex: i,
          verifiedAt: new Date().toISOString(),
        };
      }

      // 2. Recompute hash from content
      const recomputed = computeAuditHash(
        entry.previousHash,
        entry.action,
        entry.actor,
        entry.details,
        entry.timestamp,
      );

      if (recomputed !== entry.currentHash) {
        this.logger.error(`🚨 CONTENT TAMPER DETECTED at index ${i}: Expected hash ${recomputed}, found ${entry.currentHash}`);
        return {
          isChainValid: false,
          totalRecordsChecked: i,
          genesisHash: GENESIS_HASH,
          headHash: this.auditWriter.getLastHash(),
          tamperDetected: true,
          tamperedEntryIndex: i,
          verifiedAt: new Date().toISOString(),
        };
      }

      expectedPreviousHash = entry.currentHash;
    }

    this.logger.log(`✅ Audit chain verified successfully: ${chain.length} records intact.`);

    return {
      isChainValid: true,
      totalRecordsChecked: chain.length,
      genesisHash: GENESIS_HASH,
      headHash: this.auditWriter.getLastHash(),
      tamperDetected: false,
      verifiedAt: new Date().toISOString(),
    };
  }
}
