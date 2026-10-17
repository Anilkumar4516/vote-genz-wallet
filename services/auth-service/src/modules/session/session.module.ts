import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';
import { JwtStrategy } from './jwt.strategy';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') || 'super_secret_auth_jwt_key_min_32_bytes_random',
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SessionService, JwtStrategy, RedisService],
  exports: [SessionService, JwtModule, PassportModule],
})
export class SessionModule {}
