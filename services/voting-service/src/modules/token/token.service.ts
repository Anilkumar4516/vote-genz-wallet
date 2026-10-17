import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { RegistryDataSource } from '../../database/registry.datasource';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  // In-memory / DB representation: stores ONLY tokenHash -> metadata
  private tokenStore: Map<string, { electionId: string; voterHash: string; isBurned: boolean; expiresAt: number }> = new Map();

  constructor(private readonly registryDataSource: RegistryDataSource) {}

  /**
   * Issues random token, stores ONLY its cryptographic hash.
   * The server never retains rawToken, enforcing unlikability.
   */
  async issueVotingToken(voterHash: string, electionId: string): Promise<{ rawToken: string; expiresAt: string }> {
    // 1. Verify voter has not already participated
    const participationCheck = await this.registryDataSource.query(
      `SELECT id FROM voter_participations WHERE voter_hash = $1 AND election_id = $2 LIMIT 1;`,
      [voterHash, electionId],
    ).catch(() => ({ rowCount: 0, rows: [] }));

    if (participationCheck.rowCount > 0) {
      throw new ConflictException('Voter has already cast a ballot in this election.');
    }

    // 2. Generate random 256-bit blind token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const ttlMs = 15 * 60 * 1000; // 15 minutes
    const expiresAt = Date.now() + ttlMs;

    // 3. Store ONLY tokenHash
    this.tokenStore.set(tokenHash, {
      electionId,
      voterHash,
      isBurned: false,
      expiresAt,
    });

    this.logger.log(`Issued blind voting token for election [${electionId}]. Stored tokenHash: ${tokenHash.slice(0, 8)}...`);

    return {
      rawToken,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  async validateAndBurnToken(rawToken: string, electionId: string): Promise<{ voterHash: string }> {
    const tokenHash = this.hashToken(rawToken);
    const entry = this.tokenStore.get(tokenHash);

    if (!entry) {
      throw new ConflictException('Invalid or non-existent voting token.');
    }

    if (entry.electionId !== electionId) {
      throw new ConflictException('Voting token is not valid for this election.');
    }

    if (entry.isBurned) {
      throw new ConflictException('Voting token has already been burned.');
    }

    if (Date.now() > entry.expiresAt) {
      throw new ConflictException('Voting token has expired.');
    }

    // Burn token atomically
    entry.isBurned = true;
    return { voterHash: entry.voterHash };
  }
}
