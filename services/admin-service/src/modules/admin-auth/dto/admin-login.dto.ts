import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class AdminLoginDto {
  @IsEmail({}, { message: 'Valid administrator email address required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
