import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { KmsService } from './kms.service';

export interface EncryptedBallotEnvelope {
  ciphertext: string;       // Hex encoded ciphertext
  iv: string;               // 12-byte initialization vector (hex)
  authTag: string;          // 16-byte GCM authentication tag (hex)
  encryptedKey: string;     // Envelope-encrypted DEK (base64)
}

@Injectable()
export class BallotEncryptionService {
  constructor(private readonly kmsService: KmsService) {}

  /**
   * Encrypts ballot payload using AES-256-GCM authenticated encryption.
   */
  async encrypt(payload: string, associatedData: string = ''): Promise<EncryptedBallotEnvelope> {
    const { plaintextKey, encryptedKey } = await this.kmsService.getDataKey();
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', plaintextKey, iv);

    if (associatedData) {
      cipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }

    let ciphertext = cipher.update(payload, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      ciphertext,
      iv: iv.toString('hex'),
      authTag,
      encryptedKey,
    };
  }

  /**
   * Decrypts AES-256-GCM ballot payload, verifying GCM authentication tag.
   */
  async decrypt(envelope: EncryptedBallotEnvelope, associatedData: string = ''): Promise<string> {
    const key = await this.kmsService.decryptDataKey(envelope.encryptedKey);
    const iv = Buffer.from(envelope.iv, 'hex');
    const authTag = Buffer.from(envelope.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    if (associatedData) {
      decipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }

    let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
