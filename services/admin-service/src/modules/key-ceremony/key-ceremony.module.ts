import { Module } from '@nestjs/common';
import { KeyCeremonyController } from './key-ceremony.controller';
import { KeyCeremonyService } from './key-ceremony.service';

@Module({
  controllers: [KeyCeremonyController],
  providers: [KeyCeremonyService],
  exports: [KeyCeremonyService],
})
export class KeyCeremonyModule {}
