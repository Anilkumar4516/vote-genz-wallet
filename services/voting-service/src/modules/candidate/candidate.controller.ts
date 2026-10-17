import { Controller, Get, Param } from '@nestjs/common';
import { CandidateService } from './candidate.service';

@Controller('elections')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get(':id/candidates')
  async getCandidates(@Param('id') id: string) {
    return this.candidateService.getCandidatesByElectionId(id);
  }
}
