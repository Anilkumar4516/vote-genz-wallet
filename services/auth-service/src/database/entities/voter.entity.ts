export interface VoterEntity {
  id: string;
  nationalId: string;
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  photoUrl: string; // Used for citizen identity verification screen
  devicePublicKey?: string; // Stored hardware/biometric public key
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  isRegistered: boolean;
  constituencyCode: string;
  failedAttemptCount: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
