'use client';

import { create } from 'zustand';
import { Candidate, BallotCastReceipt } from '@vote-wallet/shared-types';
import { VotingStep } from '../types';

interface VoteFlowState {
  currentStep: VotingStep;
  electionId: string;
  hasConsented: boolean;
  faceVerified: boolean;
  fingerprintVerified: boolean;
  votingToken: string | null;
  selectedCandidate: Candidate | null;
  receipt: BallotCastReceipt | null;

  setStep: (step: VotingStep) => void;
  setElectionId: (id: string) => void;
  setConsent: (consent: boolean) => void;
  setFaceVerified: (verified: boolean) => void;
  setFingerprintVerified: (verified: boolean) => void;
  setVotingToken: (token: string) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setReceipt: (receipt: BallotCastReceipt) => void;
  resetFlow: () => void;
}

export const useVoteFlowStore = create<VoteFlowState>((set) => ({
  currentStep: 'LOGIN',
  electionId: 'elec_2026_national_general',
  hasConsented: false,
  faceVerified: false,
  fingerprintVerified: false,
  votingToken: null,
  selectedCandidate: null,
  receipt: null,

  setStep: (step) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vote_flow_step', step);
    }
    set({ currentStep: step });
  },

  setElectionId: (electionId) => set({ electionId }),
  setConsent: (hasConsented) => set({ hasConsented }),
  setFaceVerified: (faceVerified) => set({ faceVerified }),
  setFingerprintVerified: (fingerprintVerified) => set({ fingerprintVerified }),
  setVotingToken: (votingToken) => set({ votingToken }),
  setSelectedCandidate: (selectedCandidate) => set({ selectedCandidate }),
  setReceipt: (receipt) => set({ receipt }),

  resetFlow: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vote_flow_step');
    }
    set({
      currentStep: 'LOGIN',
      hasConsented: false,
      faceVerified: false,
      fingerprintVerified: false,
      votingToken: null,
      selectedCandidate: null,
      receipt: null,
    });
  },
}));
