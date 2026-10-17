export interface SmsProvider {
  sendOtp(mobileNumber: string, otp: string): Promise<boolean>;
}

export const SMS_PROVIDER_TOKEN = 'SMS_PROVIDER_TOKEN';
