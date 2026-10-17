/**
 * Authentication and Session Types
 */

export interface LoginDto {
  nationalId: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  sessionId: string;
  message: string;
  expiresInSeconds: number;
  phoneMasked?: string;
}

export interface VerifyOtpDto {
  sessionId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  voterHash: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
}

export interface FingerprintVerifyDto {
  challengeId: string;
  nationalId: string;
  biometricSignature: string;
  deviceId: string;
}

export interface FingerprintVerifyResponse {
  result: 'PASS' | 'FAIL';
  verificationToken?: string;
  message: string;
}

export interface FaceChallengeResponse {
  challengeId: string;
  nationalId: string;
  requiredActions: string[];
  expiresInSec: number;
}

export interface FaceVerifyRequest {
  challengeId: string;
  nationalId: string;
  livenessActions?: string[];
  liveImageBase64?: string;
  liveEmbedding?: number[];
}

export interface FaceVerifyResponse {
  result: 'PASS' | 'FAIL';
  nationalId: string;
  verificationToken?: string;
  message: string;
}

export interface JwtSessionPayload {
  sub: string;
  nationalId: string;
  voterHash: string;
  roles: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface AdminLoginDto {
  username: string;
  passwordHash: string;
  totpToken?: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  adminId: string;
  role: 'SUPER_ADMIN' | 'COMMISSIONER' | 'AUDITOR' | 'OPERATOR';
  expiresInSeconds: number;
}
