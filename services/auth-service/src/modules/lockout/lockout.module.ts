import { Module } from '@nestjs/common';
import { LockoutService } from './lockout.service';
import { RedisService } from '../redis/redis.service';

@Module({
  providers: [LockoutService, RedisService],
  exports: [LockoutService],
})
export class LockoutModule {}
