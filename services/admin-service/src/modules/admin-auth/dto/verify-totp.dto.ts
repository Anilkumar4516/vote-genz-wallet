import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyTotpDto {
  @IsString()
  @IsNotEmpty({ message: 'mfaSessionToken is required' })
  mfaSessionToken: string;

  @IsString()
  @Length(6, 6, { message: 'TOTP authenticator code must be exactly 6 digits' })
  totpCode: string;
}
