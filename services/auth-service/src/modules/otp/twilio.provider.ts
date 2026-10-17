import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.provider';

@Injectable()
export class TwilioProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioProvider.name);
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('sms.twilio.accountSid') || '';
    this.authToken = this.configService.get<string>('sms.twilio.authToken') || '';
    this.fromNumber = this.configService.get<string>('sms.twilio.fromNumber') || '';
  }

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    this.logger.log(`[Twilio] Dispatching authentication SMS to ${mobileNumber.slice(0, 4)}****`);

    try {
      if (this.accountSid && this.authToken && typeof fetch !== 'undefined') {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const body = new URLSearchParams({
          To: mobileNumber,
          From: this.fromNumber,
          Body: `Your Vote Wallet security verification code is: ${otp}. Valid for 5 minutes. Do not share.`,
        });

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });
        return res.ok;
      }
    } catch (err) {
      this.logger.warn(`Twilio dispatch error: ${err.message}`);
    }

    this.logger.log(`📱 [MOCK SMS - Twilio] OTP for ${mobileNumber}: ${otp}`);
    return true;
  }
}
