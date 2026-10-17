/**
 * Election, Candidate, and Tally Domain Types
 */

export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'TALLIED' | 'SEALED';

export type ElectionType = 'PARLIAMENTARY' | 'PRESIDENTIAL' | 'LOCAL' | 'REFERENDUM';

export interface Election {
  id: string;
  title: string;
  description: string;
  type: ElectionType;
  status: ElectionStatus;
  startTime: string;
  endTime: string;
  constituencyCodes: string[];
  totalEligibleVoters: number;
  candidateCount: number;
  publicKey?: string; // Trustee collective public key for ballot encryption
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  fullName: string;
  partyName: string;
  partyLogoUrl?: string;
  ballotNumber: number;
  biography?: string;
  constituencyCode?: string;
  createdAt?: string;
}

export interface CandidateVoteResult {
  candidateId: string;
  candidateName: string;
  partyName: string;
  votes: number;
  percentage: number;
}

export interface ElectionTally {
  electionId: string;
  totalBallotsCast: number;
  totalParticipations: number;
  isBalanced: boolean; // Mathematically: totalBallotsCast === totalParticipations
  results: CandidateVoteResult[];
  merkleRoot: string;
  talliedAt: string;
  signatures: {
    trusteeId: string;
    signature: string;
  }[];
}

export interface CreateElectionDto {
  title: string;
  description: string;
  type: ElectionType;
  startTime: string;
  endTime: string;
  constituencyCodes: string[];
}

export interface CreateCandidateDto {
  electionId: string;
  fullName: string;
  partyName: string;
  partyLogoUrl?: string;
  ballotNumber: number;
  biography?: string;
  constituencyCode?: string;
}
