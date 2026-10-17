import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { RegistryDataSource } from '../../database/registry.datasource';

@Module({
  controllers: [TokenController],
  providers: [TokenService, RegistryDataSource],
  exports: [TokenService],
})
export class TokenModule {}
