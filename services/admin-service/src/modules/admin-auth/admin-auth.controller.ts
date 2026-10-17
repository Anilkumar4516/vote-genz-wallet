import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: AdminLoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('verify-totp')
  @HttpCode(HttpStatus.OK)
  async verifyTotp(@Body() body: VerifyTotpDto) {
    return this.authService.verifyTotp(body.mfaSessionToken, body.totpCode);
  }
}
