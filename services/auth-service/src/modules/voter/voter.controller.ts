import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { VoterService } from './voter.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('voter')
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const nationalId = req.user?.nationalId || 'VOTER-DEMO-9901';
    return this.voterService.getVoterProfile(nationalId);
  }
}
