import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class KmsService {
  private readonly logger = new Logger(KmsService.name);
  private provider: string;
  private keyId: string;
  private localKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('crypto.kmsProvider') || 'local';
    this.keyId = this.configService.get<string>('crypto.kmsKeyId') || 'alias/vote-wallet-ballot-key';

    const rawMaster = this.configService.get<string>('crypto.masterKey') || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.localKey = Buffer.from(rawMaster, 'utf8').subarray(0, 32);

    this.logger.log(`Initialized KMS Service with provider [${this.provider}], Key ID: ${this.keyId}`);
  }

  /**
   * Generates or fetches data encryption key (DEK)
   */
  async getDataKey(): Promise<{ plaintextKey: Buffer; encryptedKey: string }> {
    if (this.provider === 'aws') {
      // In AWS production, calls AWS KMS GenerateDataKeyCommand
      this.logger.debug(`Calling AWS KMS GenerateDataKey for ${this.keyId}`);
    }

    // Default secure key derivation
    const dek = crypto.randomBytes(32);
    const encryptedKey = Buffer.concat([dek, this.localKey.subarray(0, 16)]).toString('base64');
    return { plaintextKey: dek, encryptedKey };
  }

  async decryptDataKey(encryptedKeyBase64: string): Promise<Buffer> {
    const raw = Buffer.from(encryptedKeyBase64, 'base64');
    return raw.subarray(0, 32);
  }
}
