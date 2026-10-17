import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface VerificationFactorsState {
  nationalId: string;
  otpPassed: boolean;
  facePassed: boolean;
  fingerprintPassed: boolean;
  lastUpdated: string;
}

@Injectable()
export class VerificationStateService {
  private readonly logger = new Logger(VerificationStateService.name);
  private readonly ttlSeconds = 900; // 15 minutes

  constructor(private readonly redisService: RedisService) {}

  /**
   * Retrieves current factor verification state from Redis
   */
  async getState(nationalId: string): Promise<VerificationFactorsState> {
    const client = this.redisService.getClient();
    if (client) {
      const raw = await client.get(`verification_state:${nationalId}`).catch(() => null);
      if (raw) {
        return JSON.parse(raw);
      }
    }

    return {
      nationalId,
      otpPassed: false,
      facePassed: false,
      fingerprintPassed: false,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Marks a specific factor (otp, face, fingerprint) as verified in Redis
   */
  async markFactorVerified(
    nationalId: string,
    factor: 'otpPassed' | 'facePassed' | 'fingerprintPassed',
  ): Promise<VerificationFactorsState> {
    const current = await this.getState(nationalId);
    current[factor] = true;
    current.lastUpdated = new Date().toISOString();

    const client = this.redisService.getClient();
    if (client) {
      await client.set(
        `verification_state:${nationalId}`,
        JSON.stringify(current),
        'EX',
        this.ttlSeconds,
      );
    }

    const fullyVerified = current.otpPassed && current.facePassed && current.fingerprintPassed;
    this.logger.log(`Updated verification state for ${nationalId}: [${factor} = TRUE] (All complete: ${fullyVerified})`);

    return current;
  }

  /**
   * Clears state after voting token is burned or session ends
   */
  async clearState(nationalId: string): Promise<void> {
    const client = this.redisService.getClient();
    if (client) {
      await client.del(`verification_state:${nationalId}`);
    }
  }
}
