import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { SMS_PROVIDER_TOKEN } from './sms.provider';
import { Msg91Provider } from './msg91.provider';
import { TwilioProvider } from './twilio.provider';
import { RedisService } from '../redis/redis.service';

@Module({
  providers: [
    OtpService,
    RedisService,
    Msg91Provider,
    TwilioProvider,
    {
      provide: SMS_PROVIDER_TOKEN,
      useFactory: (config: ConfigService, msg91: Msg91Provider, twilio: TwilioProvider) => {
        const providerName = config.get<string>('sms.provider');
        if (providerName === 'twilio') {
          return twilio;
        }
        return msg91;
      },
      inject: [ConfigService, Msg91Provider, TwilioProvider],
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
