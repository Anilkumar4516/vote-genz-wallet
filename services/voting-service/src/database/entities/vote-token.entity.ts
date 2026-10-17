export interface VoteToken {
  id: string;
  tokenHash: string; // SHA-256(raw_voting_token)
  electionId: string;
  isBurned: boolean;
  burnedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}
