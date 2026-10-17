import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { VoterRegistryService } from '../voter-registry/voter-registry.service';
import { OtpService } from '../otp/otp.service';
import { SessionService } from '../session/session.service';
import { LockoutService } from '../lockout/lockout.service';
import { VerificationStateService } from '../biometric/verification-state.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly voterRegistry: VoterRegistryService,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly lockoutService: LockoutService,
    private readonly verificationState: VerificationStateService,
  ) {}

  /**
   * Step 1: Citizen initiates login with National ID and mobile number.
   * Validates voter registry status and dispatches OTP.
   */
  async login(dto: LoginDto) {
    const { nationalId, mobileNumber } = dto;

    // 1. Assert account is not currently locked out
    await this.lockoutService.assertNotLocked(nationalId);

    // 2. Fetch citizen record from read-only voter registry DB
    const voter = await this.voterRegistry.findByNationalId(nationalId);
    if (!voter) {
      await this.lockoutService.recordFailedAttempt(nationalId, 'National ID not found in voter registry');
      throw new UnauthorizedException('Citizen record not found in the official voter registry.');
    }

    if (voter.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Citizen account status is ${voter.status}. Voting access denied.`);
    }

    // 3. Dispatch one-time authentication code
    const otpResult = await this.otpService.generateAndSendOtp(nationalId, mobileNumber);

    return {
      status: 'OTP_SENT',
      message: 'One-time authorization code dispatched to citizen registered mobile number.',
      expiresInSec: otpResult.expiresInSec,
      nationalId,
    };
  }

  /**
   * Step 2: Citizen verifies one-time password.
   * Enforces 3-strike lockout, marks OTP factor verified, and issues short-lived JWT + Redis session.
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const { nationalId, otp } = dto;

    // 1. Assert account is not locked
    await this.lockoutService.assertNotLocked(nationalId);

    // 2. Verify OTP against Redis hash
    const isValid = await this.otpService.verifyOtp(nationalId, otp).catch(async (err) => {
      await this.lockoutService.recordFailedAttempt(nationalId, 'Invalid OTP submitted');
      throw err;
    });

    if (!isValid) {
      await this.lockoutService.recordFailedAttempt(nationalId, 'Incorrect OTP code');
      throw new UnauthorizedException('Invalid verification code.');
    }

    // 3. Reset failed attempts upon successful factor
    await this.lockoutService.resetAttempts(nationalId);

    // 4. Mark OTP factor verified in Redis state
    await this.verificationState.markFactorVerified(nationalId, 'otpPassed');

    // 5. Query voter details & create short-lived JWT + Redis session
    const voter = await this.voterRegistry.findByNationalId(nationalId);
    const session = await this.sessionService.createSession({
      id: voter?.id || 'voter-uuid-mock',
      nationalId,
      fullName: voter?.fullName || 'Verified Citizen',
      isRegistered: voter?.isRegistered ?? true,
    });

    return {
      status: 'AUTHENTICATED',
      message: 'Citizen primary authentication successful. Proceed to biometric & identity verification.',
      session,
      voter: {
        id: voter?.id,
        nationalId,
        fullName: voter?.fullName,
        isRegistered: voter?.isRegistered,
      },
    };
  }
}
