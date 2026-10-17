export type ElectionState = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'SEALED' | 'TALLIED';

export interface ElectionEntity {
  id: string;
  title: string;
  description: string;
  state: ElectionState;
  startTime: Date;
  endTime: Date;
  candidateIds: string[];
  totalEligibleVoters: number;
  totalBallotsCast?: number;
  createdAt: Date;
  updatedAt: Date;
}
