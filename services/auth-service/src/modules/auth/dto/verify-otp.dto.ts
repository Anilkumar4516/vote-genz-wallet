import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'nationalId is required' })
  nationalId: string;

  @IsString()
  @IsNotEmpty({ message: 'otp is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 numeric digits' })
  otp: string;
}
