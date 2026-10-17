import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TokenService } from './token.service';
import { IssueTokenDto } from './dto/issue-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerifiedVoterGuard } from '../../common/guards/verified-voter.guard';
import { ElectionOpenGuard } from '../../common/guards/election-open.guard';
import { CurrentVoter } from '../../common/decorators/current-voter.decorator';

@Controller('vote')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('token')
  @UseGuards(JwtAuthGuard, VerifiedVoterGuard, ElectionOpenGuard)
  @HttpCode(HttpStatus.OK)
  async issueToken(
    @Body() body: IssueTokenDto,
    @CurrentVoter('voterHash') voterHash: string,
  ) {
    const effectiveVoterHash = voterHash || body.voterHash;
    return this.tokenService.issueVotingToken(effectiveVoterHash, body.electionId);
  }
}
