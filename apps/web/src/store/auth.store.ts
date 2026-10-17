'use client';

import { create } from 'zustand';
import { VoterProfile } from '@vote-wallet/shared-types';

interface AuthState {
  token: string | null;
  voterProfile: VoterProfile | null;
  sessionId: string | null;
  maskedPhone: string | null;
  nationalId: string | null;
  isAuthenticated: boolean;
  setSession: (sessionId: string, nationalId: string, maskedPhone?: string) => void;
  setAuthenticated: (token: string, profile?: VoterProfile) => void;
  setProfile: (profile: VoterProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  voterProfile: null,
  sessionId: null,
  maskedPhone: null,
  nationalId: null,
  isAuthenticated: false,

  setSession: (sessionId, nationalId, maskedPhone) => {
    set({ sessionId, nationalId, maskedPhone: maskedPhone || null });
  },

  setAuthenticated: (token, profile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vote_access_token', token);
    }
    set({
      token,
      voterProfile: profile || null,
      isAuthenticated: true,
    });
  },

  setProfile: (profile) => {
    set({ voterProfile: profile });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vote_access_token');
      localStorage.removeItem('vote_flow_step');
    }
    set({
      token: null,
      voterProfile: null,
      sessionId: null,
      nationalId: null,
      isAuthenticated: false,
    });
  },
}));
