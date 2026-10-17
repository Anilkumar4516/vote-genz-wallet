import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { BallotBoxDataSource } from '../../database/ballotbox.datasource';

@Module({
  controllers: [ReceiptController],
  providers: [ReceiptService, BallotBoxDataSource],
  exports: [ReceiptService],
})
export class ReceiptModule {}
