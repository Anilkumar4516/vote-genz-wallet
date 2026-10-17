import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService, CitizenJwtPayload } from './session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'super_secret_auth_jwt_key_min_32_bytes_random',
    });
  }

  async validate(payload: CitizenJwtPayload) {
    // Check that session is still active and unrevoked in Redis
    await this.sessionService.validateSession(payload.sessionId);
    return payload;
  }
}
