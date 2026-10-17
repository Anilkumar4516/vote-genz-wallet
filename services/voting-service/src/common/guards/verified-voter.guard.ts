import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { VotingErrorCode } from '../constants/error-codes';

@Injectable()
export class VerifiedVoterGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const factors = request.user?.verifiedFactors || {
      otp: request.headers['x-otp-verified'] === 'true',
      face: request.headers['x-face-verified'] === 'true',
      fingerprint: request.headers['x-fingerprint-verified'] === 'true',
    };

    const passedOtp = Boolean(factors.otp);
    const passedFace = Boolean(factors.face);
    const passedFingerprint = Boolean(factors.fingerprint);

    if (!passedOtp || !passedFace || !passedFingerprint) {
      throw new ForbiddenException({
        code: VotingErrorCode.BIOMETRIC_VERIFICATION_REQUIRED,
        message: 'Strict verification policy requires OTP, Facial verification, and Fingerprint checks to all have passed before casting ballot',
        missingVerifications: {
          otpPassed: passedOtp,
          facePassed: passedFace,
          fingerprintPassed: passedFingerprint,
        },
      });
    }

    return true;
  }
}
