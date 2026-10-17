export interface VoterEntity {
  id: string;
  nationalId: string;
  fullName: string;
  dateOfBirth: string;
  constituencyCode: string;
  photoUrl?: string;
  faceEmbedding?: number[];
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  isRegistered: boolean;
  createdAt: Date;
  updatedAt: Date;
}
