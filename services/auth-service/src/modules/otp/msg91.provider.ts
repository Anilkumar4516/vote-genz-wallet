import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.provider';

@Injectable()
export class Msg91Provider implements SmsProvider {
  private readonly logger = new Logger(Msg91Provider.name);
  private authKey: string;
  private templateId: string;
  private senderId: string;

  constructor(private readonly configService: ConfigService) {
    this.authKey = this.configService.get<string>('sms.msg91.authKey') || '';
    this.templateId = this.configService.get<string>('sms.msg91.templateId') || '';
    this.senderId = this.configService.get<string>('sms.msg91.senderId') || 'VOTEIN';
  }

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    this.logger.log(`[MSG91] Dispatching one-time voting authorization code to ${mobileNumber.slice(0, 4)}****`);

    try {
      if (this.authKey && typeof fetch !== 'undefined') {
        const url = `https://control.msg91.com/api/v5/otp?template_id=${this.templateId}&mobile=${mobileNumber}&authkey=${this.authKey}&otp=${otp}`;
        const res = await fetch(url, { method: 'POST' });
        return res.ok;
      }
    } catch (err) {
      this.logger.warn(`MSG91 dispatch error (fallback simulated): ${err.message}`);
    }

    // In local development or mock mode
    this.logger.log(`📱 [MOCK SMS - MSG91] OTP for ${mobileNumber}: ${otp}`);
    return true;
  }
}
