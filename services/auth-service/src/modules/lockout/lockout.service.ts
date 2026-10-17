import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds?: number;
  failedAttempts: number;
}

@Injectable()
export class LockoutService {
  private readonly logger = new Logger(LockoutService.name);
  private readonly maxAttempts: number;
  private readonly lockoutDuration: number;
  private readonly adminAlertUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.maxAttempts = this.configService.get<number>('lockout.maxFailedAttempts') || 3;
    this.lockoutDuration = this.configService.get<number>('lockout.lockoutDurationSeconds') || 1800;
    this.adminAlertUrl = this.configService.get<string>('lockout.adminAlertUrl') || 'http://localhost:3003/admin/audit-log';
  }

  /**
   * Asserts that the citizen account is not currently locked out
   */
  async assertNotLocked(nationalId: string): Promise<void> {
    const isLocked = await this.redisService.getClient()?.get(`lockout:${nationalId}`).catch(() => null);
    if (isLocked) {
      const ttl = (await this.redisService.getClient()?.ttl(`lockout:${nationalId}`).catch(() => 1800)) || 1800;
      throw new ForbiddenException(
        `Security Lockout Active: Account locked due to 3 consecutive failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes or contact the electoral commission.`,
      );
    }
  }

  /**
   * Records a failed login or verification attempt.
   * On the 3rd failed attempt: Locks account and immediately alerts electoral administration.
   */
  async recordFailedAttempt(nationalId: string, reason: string): Promise<number> {
    const client = this.redisService.getClient();
    const attemptsKey = `failed_attempts:${nationalId}`;

    let currentAttempts = 1;
    if (client) {
      currentAttempts = await client.incr(attemptsKey);
      await client.expire(attemptsKey, 900); // 15 minutes window
    }

    this.logger.warn(`Failed attempt #${currentAttempts}/${this.maxAttempts} for citizen ${nationalId}: ${reason}`);

    if (currentAttempts >= this.maxAttempts) {
      if (client) {
        await client.set(`lockout:${nationalId}`, 'LOCKED', 'EX', this.lockoutDuration);
        await client.del(attemptsKey);
      }

      await this.triggerAdminSecurityAlert(nationalId, currentAttempts, reason);

      throw new ForbiddenException(
        `🚨 ACCOUNT LOCKED: Maximum failed verification attempts (${this.maxAttempts}) exceeded. Security lockdown engaged and electoral admin alerted.`,
      );
    }

    return currentAttempts;
  }

  /**
   * Clears failed attempts counter upon successful verification
   */
  async resetAttempts(nationalId: string): Promise<void> {
    const client = this.redisService.getClient();
    if (client) {
      await client.del(`failed_attempts:${nationalId}`);
    }
  }

  private async triggerAdminSecurityAlert(nationalId: string, attempts: number, reason: string): Promise<void> {
    this.logger.error(`🚨 ALERT: Citizen ${nationalId} has been LOCKED OUT after ${attempts} failed attempts. Reason: ${reason}`);

    const payload = {
      action: 'CITIZEN_ACCOUNT_LOCKED',
      actor: nationalId,
      severity: 'CRITICAL',
      details: {
        reason,
        failedAttempts: attempts,
        lockoutDurationSeconds: this.lockoutDuration,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      if (typeof fetch !== 'undefined') {
        fetch(this.adminAlertUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch((err) => {
          this.logger.warn(`Failed to dispatch alert to admin service: ${err.message}`);
        });
      }
    } catch {
      // Graceful local handling
    }
  }
}
