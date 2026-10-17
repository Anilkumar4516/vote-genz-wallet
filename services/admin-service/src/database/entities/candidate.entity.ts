export interface CandidateEntity {
  id: string;
  electionId: string;
  name: string;
  party: string;
  symbol: string;
  ballotOrder: number;
  photoUrl?: string;
  biography?: string;
  createdAt: Date;
}
