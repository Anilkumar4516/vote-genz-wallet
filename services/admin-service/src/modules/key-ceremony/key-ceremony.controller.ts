import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { KeyCeremonyService } from './key-ceremony.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class InitiateCeremonyDto {
  electionId: string;
}

class ApproveCeremonyDto {
  electionId: string;
  trusteeId: string;
  shareValue?: string;
}

@Controller('admin/key-ceremony')
@UseGuards(RolesGuard)
export class KeyCeremonyController {
  constructor(private readonly keyCeremonyService: KeyCeremonyService) {}

  @Post('initiate')
  @Roles('ADMIN', 'COMMISSIONER')
  @HttpCode(HttpStatus.OK)
  async initiate(@Body() body: InitiateCeremonyDto) {
    return this.keyCeremonyService.initiateCeremony(body.electionId);
  }

  @Post('approve')
  @Roles('ADMIN', 'COMMISSIONER')
  @HttpCode(HttpStatus.OK)
  async approve(@Body() body: ApproveCeremonyDto) {
    return this.keyCeremonyService.submitApproval(body.electionId, body.trusteeId, body.shareValue);
  }

  @Get('status/:electionId')
  @Roles('ADMIN', 'AUDITOR', 'COMMISSIONER')
  async getStatus(@Param('electionId') electionId: string) {
    return this.keyCeremonyService.getStatus(electionId);
  }
}
