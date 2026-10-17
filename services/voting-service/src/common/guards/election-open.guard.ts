import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { VotingErrorCode } from '../constants/error-codes';

@Injectable()
export class ElectionOpenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const electionStatus = request.headers['x-election-status'] || 'OPEN';

    if (electionStatus === 'CLOSED' || electionStatus === 'SEALED') {
      throw new ForbiddenException({
        code: VotingErrorCode.ELECTION_CLOSED,
        message: 'The electoral window for this ballot has concluded. No more votes may be cast.',
      });
    }

    if (electionStatus === 'UPCOMING' || electionStatus === 'DRAFT') {
      throw new ForbiddenException({
        code: VotingErrorCode.ELECTION_NOT_OPEN,
        message: 'The election is not yet open for polling.',
      });
    }

    return true;
  }
}
