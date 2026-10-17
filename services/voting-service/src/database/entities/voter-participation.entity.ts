export interface VoterParticipation {
  id: string;
  voterHash: string; // SHA-256(national_id + election_salt)
  electionId: string;
  participatedAt: Date;
}
