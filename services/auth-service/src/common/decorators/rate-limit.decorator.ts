import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'RATE_LIMIT_KEY';
export interface RateLimitOptions {
  limit: number;
  windowSec: number;
}

export const RateLimit = (limit: number = 5, windowSec: number = 60) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowSec });
