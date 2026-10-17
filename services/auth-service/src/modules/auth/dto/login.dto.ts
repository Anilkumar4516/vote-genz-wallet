import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'nationalId is required' })
  @Length(4, 30, { message: 'nationalId must be between 4 and 30 characters' })
  nationalId: string;

  @IsString()
  @IsNotEmpty({ message: 'mobileNumber is required for multi-factor OTP dispatch' })
  mobileNumber: string;
}
