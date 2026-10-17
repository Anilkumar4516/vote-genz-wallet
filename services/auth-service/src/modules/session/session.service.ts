import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

export interface CitizenJwtPayload {
  sub: string;             // voter UUID
  nationalId: string;
  sessionId: string;
  fullName: string;
  isRegistered: boolean;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessionTtl: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.sessionTtl = this.configService.get<number>('jwt.sessionTtlSeconds') || 900; // 15 mins
  }

  /**
   * Creates short-lived signed JWT and registers active session in Redis
   */
  async createSession(voter: { id: string; nationalId: string; fullName: string; isRegistered: boolean }): Promise<{
    accessToken: string;
    sessionId: string;
    expiresIn: number;
  }> {
    const sessionId = 'sess_' + crypto.randomBytes(24).toString('hex');
    const payload: CitizenJwtPayload = {
      sub: voter.id,
      nationalId: voter.nationalId,
      sessionId,
      fullName: voter.fullName,
      isRegistered: voter.isRegistered,
    };

    const accessToken = this.jwtService.sign(payload);

    // Save session in Redis
    const client = this.redisService.getClient();
    if (client) {
      await client.set(
        `session:${sessionId}`,
        JSON.stringify({ ...payload, createdAt: Date.now() }),
        'EX',
        this.sessionTtl,
      );
    }

    this.logger.log(`Created short-lived session [${sessionId}] for citizen ${voter.nationalId}`);

    return {
      accessToken,
      sessionId,
      expiresIn: this.sessionTtl,
    };
  }

  /**
   * Validates active session presence in Redis (supports instant revocation)
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const client = this.redisService.getClient();
    if (!client) {
      return true; // Local mock fallback
    }

    const session = await client.get(`session:${sessionId}`);
    if (!session) {
      throw new UnauthorizedException('Session expired or revoked.');
    }
    return true;
  }

  /**
   * Explicitly revokes active session from Redis
   */
  async revokeSession(sessionId: string): Promise<void> {
    const client = this.redisService.getClient();
    if (client) {
      await client.del(`session:${sessionId}`);
    }
    this.logger.log(`Revoked session [${sessionId}]`);
  }
}
