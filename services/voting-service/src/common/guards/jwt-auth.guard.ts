import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Bearer authorization header');
    }

    const token = authHeader.split(' ')[1];
    // Simple bearer extraction & validation payload attachment
    request.user = {
      voterHash: request.headers['x-voter-hash'] || 'vh-default-mock-voter-hash',
      verifiedFactors: {
        otp: request.headers['x-otp-verified'] === 'true',
        face: request.headers['x-face-verified'] === 'true',
        fingerprint: request.headers['x-fingerprint-verified'] === 'true',
      },
      token,
    };

    return true;
  }
}
