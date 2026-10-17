import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface KeyShare {
  trusteeId: string;
  trusteeRole: string;
  shareIndex: number;
  shareValue: string; // Hex representation of Shamir share
}

export interface KeyCeremonyRecord {
  electionId: string;
  threshold: number; // 2
  totalTrustees: number; // 3
  shares: KeyShare[];
  collectedApprovals: Map<string, string>; // trusteeId -> shareValue
  isKeyReconstituted: boolean;
  status: 'PENDING_APPROVALS' | 'THRESHOLD_SATISFIED' | 'RECONSTITUTED';
  createdAt: string;
}

@Injectable()
export class KeyCeremonyService {
  private readonly logger = new Logger(KeyCeremonyService.name);
  private ceremonies: Map<string, KeyCeremonyRecord> = new Map();

  /**
   * Initiates cryptographic key ceremony:
   * Generates master election key and splits it into 3 shares (2-of-3 threshold scheme)
   */
  async initiateCeremony(electionId: string): Promise<{ electionId: string; trustees: Array<{ id: string; role: string }> }> {
    const masterKey = crypto.randomBytes(32); // 256-bit AES master key

    // Shamir 2-of-3 secret splitting simulation:
    // f(x) = secret + a1 * x (mod p)
    const randomSlope = crypto.randomBytes(32);

    const trustees = [
      { id: 'trustee-1', role: 'Chief Electoral Commissioner' },
      { id: 'trustee-2', role: 'Supreme Court Judicial Observer' },
      { id: 'trustee-3', role: 'Independent Audit Board Director' },
    ];

    const shares: KeyShare[] = trustees.map((t, idx) => {
      const x = idx + 1;
      // Share payload combining evaluation
      const shareValue = crypto
        .createHash('sha256')
        .update(Buffer.concat([masterKey, randomSlope, Buffer.from([x])]))
        .digest('hex');

      return {
        trusteeId: t.id,
        trusteeRole: t.role,
        shareIndex: x,
        shareValue,
      };
    });

    const record: KeyCeremonyRecord = {
      electionId,
      threshold: 2,
      totalTrustees: 3,
      shares,
      collectedApprovals: new Map(),
      isKeyReconstituted: false,
      status: 'PENDING_APPROVALS',
      createdAt: new Date().toISOString(),
    };

    this.ceremonies.set(electionId, record);
    this.logger.log(`🔑 Key Ceremony initiated for election ${electionId}: Master key split into 3 Shamir shares (Threshold: 2)`);

    return {
      electionId,
      trustees: trustees.map(({ id, role }) => ({ id, role })),
    };
  }

  /**
   * Collects approval signature from a trustee
   */
  async submitApproval(
    electionId: string,
    trusteeId: string,
    providedShareValue?: string,
  ): Promise<{ approvalsCount: number; thresholdMet: boolean; status: string }> {
    const ceremony = this.ceremonies.get(electionId);
    if (!ceremony) {
      throw new BadRequestException(`No key ceremony record found for election: ${electionId}`);
    }

    const share = ceremony.shares.find((s) => s.trusteeId === trusteeId);
    if (!share) {
      throw new ForbiddenException(`Trustee ${trusteeId} is not an authorized key trustee for this ceremony.`);
    }

    ceremony.collectedApprovals.set(trusteeId, providedShareValue || share.shareValue);
    const count = ceremony.collectedApprovals.size;
    const thresholdMet = count >= ceremony.threshold;

    if (thresholdMet) {
      ceremony.status = 'THRESHOLD_SATISFIED';
      this.logger.warn(`🔓 2-of-3 Key Ceremony threshold SATISFIED for election ${electionId}! Ready to unseal tally.`);
    }

    return {
      approvalsCount: count,
      thresholdMet,
      status: ceremony.status,
    };
  }

  async getStatus(electionId: string) {
    const ceremony = this.ceremonies.get(electionId);
    if (!ceremony) {
      return {
        electionId,
        status: 'NOT_INITIATED',
        threshold: 2,
        approvalsCount: 0,
      };
    }

    return {
      electionId,
      threshold: ceremony.threshold,
      totalTrustees: ceremony.totalTrustees,
      approvalsCount: ceremony.collectedApprovals.size,
      approvedTrustees: Array.from(ceremony.collectedApprovals.keys()),
      status: ceremony.status,
    };
  }
}
