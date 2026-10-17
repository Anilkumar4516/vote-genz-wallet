'use client';

import { create } from 'zustand';
import { Election, VoterProfile, AuditLogEntry, Candidate } from '@vote-wallet/shared-types';

interface ElectionAdminState {
  activeElection: Election | null;
  elections: Election[];
  voters: VoterProfile[];
  candidates: Candidate[];
  auditLogs: AuditLogEntry[];
  keyCeremonyStatus: {
    electionId: string;
    isInitiated: boolean;
    requiredThreshold: number;
    submittedShares: string[];
    isReconstructed: boolean;
  } | null;

  setActiveElection: (election: Election | null) => void;
  setElections: (elections: Election[]) => void;
  setVoters: (voters: VoterProfile[]) => void;
  setCandidates: (candidates: Candidate[]) => void;
  setAuditLogs: (logs: AuditLogEntry[]) => void;
  setKeyCeremonyStatus: (status: any) => void;
}

export const useElectionAdminStore = create<ElectionAdminState>((set) => ({
  activeElection: null,
  elections: [],
  voters: [],
  candidates: [],
  auditLogs: [],
  keyCeremonyStatus: null,

  setActiveElection: (activeElection) => set({ activeElection }),
  setElections: (elections) => set({ elections }),
  setVoters: (voters) => set({ voters }),
  setCandidates: (candidates) => set({ candidates }),
  setAuditLogs: (auditLogs) => set({ auditLogs }),
  setKeyCeremonyStatus: (keyCeremonyStatus) => set({ keyCeremonyStatus }),
}));
