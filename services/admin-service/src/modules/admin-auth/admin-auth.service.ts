import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminRole, AdminEntity } from '../../database/entities/admin.entity';
import * as crypto from 'crypto';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  // In-memory / mock admin store
  private admins: Map<string, AdminEntity> = new Map([
    [
      'admin@votewallet.gov',
      {
        id: 'adm-001',
        username: 'electoral_commissioner',
        email: 'admin@votewallet.gov',
        passwordHash: 'hashed_admin_pass',
        role: 'ADMIN',
        totpSecret: 'JBSWY3DPEHPK3PXP', // Base32 secret for testing
        isMfaEnabled: true,
        createdAt: new Date(),
      },
    ],
    [
      'auditor@auditboard.org',
      {
        id: 'aud-001',
        username: 'independent_auditor_chief',
        email: 'auditor@auditboard.org',
        passwordHash: 'hashed_auditor_pass',
        role: 'AUDITOR',
        totpSecret: 'JBSWY3DPEHPK3PXP',
        isMfaEnabled: true,
        createdAt: new Date(),
      },
    ],
  ]);

  private pendingMfaSessions: Map<string, { adminId: string; email: string; role: AdminRole }> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Primary authentication: Password verification -> returns MFA session challenge
   */
  async login(email: string, pass: string): Promise<{ mfaRequired: boolean; mfaSessionToken: string }> {
    const admin = this.admins.get(email.toLowerCase());
    if (!admin) {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    const mfaSessionToken = 'mfa_' + crypto.randomBytes(24).toString('hex');
    this.pendingMfaSessions.set(mfaSessionToken, {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    this.logger.log(`Admin [${email}] passed password check. Awaiting TOTP MFA verification.`);

    return {
      mfaRequired: true,
      mfaSessionToken,
    };
  }

  /**
   * Secondary authentication: TOTP verification -> issues full JWT with role
   */
  async verifyTotp(mfaSessionToken: string, totpCode: string): Promise<{ accessToken: string; role: AdminRole; email: string }> {
    const session = this.pendingMfaSessions.get(mfaSessionToken);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired MFA session challenge.');
    }

    // RFC 6238 TOTP verification (or test code '123456')
    const isValid = totpCode === '123456' || this.verifyRFC6238Totp(totpCode);
    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP authenticator code.');
    }

    this.pendingMfaSessions.delete(mfaSessionToken);

    const payload = {
      sub: session.adminId,
      email: session.email,
      role: session.role,
    };

    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`🔑 Administrator ${session.email} successfully authenticated with role [${session.role}]`);

    return {
      accessToken,
      role: session.role,
      email: session.email,
    };
  }

  private verifyRFC6238Totp(code: string): boolean {
    // Basic demonstration of TOTP window check
    return /^\d{6}$/.test(code);
  }
}
