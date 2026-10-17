import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async addCandidate(@Body() body: CreateCandidateDto) {
    return this.candidatesService.addCandidate(body);
  }

  @Get('election/:electionId')
  async getByElection(@Param('electionId') electionId: string) {
    return this.candidatesService.getCandidatesByElection(electionId);
  }
}
