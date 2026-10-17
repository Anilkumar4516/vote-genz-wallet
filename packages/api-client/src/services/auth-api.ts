import { BaseApiClient, RequestOptions } from '../base-client';
import {
  LoginDto,
  LoginResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  VoterProfile,
  FingerprintVerifyDto,
  FingerprintVerifyResponse,
  VerificationState,
} from '@vote-wallet/shared-types';

export class AuthApiClient extends BaseApiClient {
  /**
   * Request OTP verification session by national ID & phone
   */
  async login(payload: LoginDto, options?: RequestOptions): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', payload, options);
  }

  /**
   * Verify the received SMS OTP code
   */
  async verifyOtp(payload: VerifyOtpDto, options?: RequestOptions): Promise<VerifyOtpResponse> {
    const res = await this.post<VerifyOtpResponse>('/auth/verify-otp', payload, options);
    if (res?.accessToken) {
      this.setAuthToken(res.accessToken);
    }
    return res;
  }

  /**
   * Retrieve the currently authenticated voter profile (name, photo, constituency, voting status)
   */
  async getMe(options?: RequestOptions): Promise<VoterProfile> {
    return this.get<VoterProfile>('/voter/me', options);
  }

  /**
   * Submit hardware fingerprint challenge signature
   */
  async verifyFingerprint(
    payload: FingerprintVerifyDto,
    options?: RequestOptions,
  ): Promise<FingerprintVerifyResponse> {
    return this.post<FingerprintVerifyResponse>('/biometric/verify-fingerprint', payload, options);
  }

  /**
   * Retrieve current 3-factor voter verification progress (OTP, Face, Fingerprint)
   */
  async getVerificationState(options?: RequestOptions): Promise<VerificationState> {
    return this.get<VerificationState>('/biometric/state', options);
  }

  /**
   * Invalidate active JWT session and revoke Redis token
   */
  async logout(options?: RequestOptions): Promise<{ success: boolean }> {
    try {
      await this.post('/auth/logout', {}, options);
    } finally {
      this.setAuthToken(undefined);
    }
    return { success: true };
  }
}
