import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { BallotService } from './ballot.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ElectionOpenGuard } from '../../common/guards/election-open.guard';

@Controller('vote')
export class BallotController {
  constructor(private readonly ballotService: BallotService) {}

  @Post('cast')
  @UseGuards(ElectionOpenGuard)
  @HttpCode(HttpStatus.OK)
  async castVote(@Body() body: CastVoteDto) {
    return this.ballotService.castVote(body);
  }
}
