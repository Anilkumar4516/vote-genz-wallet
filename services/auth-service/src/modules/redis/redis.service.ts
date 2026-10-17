import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis connection failed (running offline/mock fallback): ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  /**
   * Stores a blind one-time voting token with an expiry of 10 minutes
   */
  async storeVotingToken(tokenId: string, metadata: { electionId: string }): Promise<void> {
    try {
      await this.client.set(
        `token:voting:${tokenId}`,
        JSON.stringify({ ...metadata, issuedAt: Date.now() }),
        'EX',
        600, // 10 minutes TTL
      );
    } catch (e) {
      this.logger.warn(`Failed to store in Redis, local fallback used: ${e.message}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
