import { Controller, Get } from '@nestjs/common';
import { VoterRegistryService } from '../voter-registry/voter-registry.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly voterRegistry: VoterRegistryService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async getHealth() {
    const dbOk = await this.voterRegistry.checkHealth();
    const redisOk = await this.redis.checkHealth();

    return {
      status: 'UP',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      dependencies: {
        voterRegistryReadDb: dbOk ? 'HEALTHY' : 'DEGRADED',
        redisCache: redisOk ? 'HEALTHY' : 'DEGRADED',
      },
    };
  }
}
