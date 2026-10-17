import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RegistryDataSource } from '../../database/registry.datasource';
import { BallotBoxDataSource } from '../../database/ballotbox.datasource';

@Module({
  controllers: [HealthController],
  providers: [RegistryDataSource, BallotBoxDataSource],
})
export class HealthModule {}
