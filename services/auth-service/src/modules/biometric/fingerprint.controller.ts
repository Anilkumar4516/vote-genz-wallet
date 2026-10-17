import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FingerprintService } from './fingerprint.service';

class VerifyFingerprintDto {
  nationalId: string;
  challenge: string;
  signature: string;
}

@Controller('verify')
export class FingerprintController {
  constructor(private readonly fingerprintService: FingerprintService) {}

  @Post('fingerprint')
  @HttpCode(HttpStatus.OK)
  async verifyFingerprint(@Body() body: VerifyFingerprintDto) {
    return this.fingerprintService.verifyDeviceSignature(body);
  }
}
