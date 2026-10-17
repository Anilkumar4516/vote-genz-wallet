import { Controller, Get, Param } from '@nestjs/common';
import { ReceiptService } from './receipt.service';

@Controller('vote')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get('receipt/:code')
  async getReceipt(@Param('code') code: string) {
    return this.receiptService.checkReceipt(code);
  }
}
