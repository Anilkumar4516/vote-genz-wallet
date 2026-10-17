import { Controller, Post, Get, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/elections')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createElection(@Body() body: CreateElectionDto) {
    return this.electionsService.createElection(body);
  }

  @Put(':id/open')
  async openElection(@Param('id') id: string) {
    return this.electionsService.setElectionState(id, 'OPEN');
  }

  @Put(':id/close')
  async closeElection(@Param('id') id: string) {
    return this.electionsService.setElectionState(id, 'CLOSED');
  }

  @Get()
  async listAll() {
    return this.electionsService.getAllElections();
  }

  @Get(':id')
  async getDetails(@Param('id') id: string) {
    return this.electionsService.getElection(id);
  }
}
