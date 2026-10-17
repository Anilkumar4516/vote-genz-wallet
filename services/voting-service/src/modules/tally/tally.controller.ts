import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TallyService } from './tally.service';
import { InternalServiceGuard } from '../../common/guards/internal-service.guard';

class RunTallyDto {
  electionId: string;
  electionStatus?: string;
}

@Controller('internal')
export class TallyController {
  constructor(private readonly tallyService: TallyService) {}

  @Post('tally')
  @UseGuards(InternalServiceGuard)
  @HttpCode(HttpStatus.OK)
  async computeTally(@Body() body: RunTallyDto) {
    return this.tallyService.computeTally(body.electionId, body.electionStatus || 'SEALED');
  }
}
