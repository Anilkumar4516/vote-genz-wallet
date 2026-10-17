import { Module } from '@nestjs/common';
import { VoterController } from './voter.controller';
import { VoterService } from './voter.service';
import { VoterRegistryService } from '../voter-registry/voter-registry.service';

@Module({
  controllers: [VoterController],
  providers: [VoterService, VoterRegistryService],
  exports: [VoterService],
})
export class VoterModule {}
