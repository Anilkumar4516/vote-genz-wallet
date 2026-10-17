/**
 * Voter Domain Types & State Models
 */

export type VoterStatus = 'ACTIVE' | 'SUSPENDED' | 'DECEASED' | 'PENDING';

export type VerificationFactor = 'OTP' | 'FACE' | 'FINGERPRINT';

export interface VoterProfile {
  id: string;
  nationalId: string;
  voterHash: string;
  fullName: string;
  constituencyCode: string;
  pollingStation: string;
  hasVoted: boolean;
  status: VoterStatus;
  photoUrl?: string;
  phoneMasked?: string;
  emailMasked?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationState {
  voterHash: string;
  otpVerified: boolean;
  faceVerified: boolean;
  fingerprintVerified: boolean;
  fullyVerified: boolean;
  verifiedAt?: string;
  expiresAt: string;
}

export interface VoterImportRecord {
  nationalId: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email?: string;
  constituencyCode: string;
  pollingStation: string;
  status?: VoterStatus;
}

export interface VoterParticipationRecord {
  id: string;
  voterHash: string;
  electionId: string;
  participationTime: string;
  ipHash?: string;
}
