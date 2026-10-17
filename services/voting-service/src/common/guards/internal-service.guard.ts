import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VotingErrorCode } from '../constants/error-codes';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedSecret = request.headers['x-internal-secret'] || request.headers['x-service-token'];
    const expectedSecret = this.configService.get<string>('security.internalServiceSecret') || 'sec_srv_inter_comm_token_99210';

    if (!providedSecret || providedSecret !== expectedSecret) {
      throw new UnauthorizedException({
        code: VotingErrorCode.UNAUTHORIZED_INTERNAL_CALL,
        message: 'Forbidden. This endpoint is restricted strictly to authorized internal cluster microservices.',
      });
    }

    return true;
  }
}
