import {
  VoterProfile,
  Candidate,
  BallotCastReceipt,
  VerificationState,
} from '@vote-wallet/shared-types';

export * from '@vote-wallet/shared-types';

export type VotingStep =
  | 'LOGIN'
  | 'OTP'
  | 'IDENTITY'
  | 'CONSENT'
  | 'VERIFY_FACE'
  | 'VERIFY_FINGERPRINT'
  | 'BALLOT'
  | 'REVIEW'
  | 'RECEIPT';

export interface VotingFlowState {
  currentStep: VotingStep;
  voterProfile: VoterProfile | null;
  verificationState: VerificationState | null;
  selectedCandidate: Candidate | null;
  votingToken: string | null;
  receipt: BallotCastReceipt | null;
  electionId: string;
}
