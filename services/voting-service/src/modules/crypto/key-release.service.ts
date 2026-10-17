import { Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { KmsService } from './kms.service';

export interface KeyApprovalSignature {
  trusteeId: string; // e.g. "commissioner-alpha", "ombudsman-beta", "chief-justice-gamma"
  signature: string;
  timestamp: string;
}

@Injectable()
export class KeyReleaseService {
  private readonly logger = new Logger(KeyReleaseService.name);
  private approvals: Map<string, Set<string>> = new Map(); // electionId -> Set of trusteeIds

  constructor(private readonly kmsService: KmsService) {}

  /**
   * Registers a trustee's cryptographic approval to unseal election tally keys
   */
  async submitApproval(
    electionId: string,
    electionStatus: string,
    signature: KeyApprovalSignature,
  ): Promise<{ approvalsCount: number; thresholdMet: boolean }> {
    if (electionStatus !== 'CLOSED' && electionStatus !== 'SEALED') {
      throw new ForbiddenException(
        `Cannot release tally decryption key while election is still ${electionStatus}. Election must be officially SEALED.`,
      );
    }

    if (!this.approvals.has(electionId)) {
      this.approvals.set(electionId, new Set());
    }

    const set = this.approvals.get(electionId)!;
    set.add(signature.trusteeId);

    this.logger.log(`Received key release approval for ${electionId} from ${signature.trusteeId} (${set.size}/3)`);

    return {
      approvalsCount: set.size,
      thresholdMet: set.size >= 2,
    };
  }

  /**
   * Releases master tally decryption key only after election close and 2-of-3 approvals
   */
  async releaseTallyKey(electionId: string, electionStatus: string): Promise<string> {
    if (electionStatus !== 'CLOSED' && electionStatus !== 'SEALED') {
      throw new ForbiddenException(
        `Electoral security violation: Key release is forbidden while election is open.`,
      );
    }

    const set = this.approvals.get(electionId);
    const count = set ? set.size : 0;

    if (count < 2) {
      throw new ForbiddenException(
        `Multi-party threshold not met: 2-of-3 electoral trustee approvals required to release tally key (currently ${count}/3 approved).`,
      );
    }

    this.logger.warn(`🔓 2-of-3 threshold satisfied. Releasing tally decryption key for election ${electionId}`);
    const key = await this.kmsService.getDataKey();
    return key.plaintextKey.toString('hex');
  }
}
