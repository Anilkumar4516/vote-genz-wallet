'use client';

import React from 'react';
import { Candidate } from '@vote-wallet/shared-types';
import { Lock, ShieldAlert, Award } from 'lucide-react';

interface ReviewSummaryProps {
  candidate: Candidate;
  electionTitle?: string;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  candidate,
  electionTitle = '2026 National General Parliamentary Election',
}) => {
  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl glass-card border border-cyan-500/30 p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Ballot Verification Summary
        </span>
        <h3 className="text-xl font-extrabold text-white">Review Before Final Seal</h3>
        <p className="text-xs text-slate-400">{electionTitle}</p>
      </div>

      {/* Selected Candidate Display Box */}
      <div className="p-5 rounded-2xl bg-surface-100 border-2 border-cyan-500/40 shadow-inner flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono text-xl font-black shrink-0">
          #{candidate.ballotNumber}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Your Chosen Candidate</span>
          <h4 className="text-lg font-extrabold text-white truncate">{candidate.fullName}</h4>
          <p className="text-xs font-semibold text-cyan-400 truncate">{candidate.partyName}</p>
        </div>
        <Award className="w-8 h-8 text-cyan-400 shrink-0" />
      </div>

      {/* Irreversible Sealing Notice */}
      <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 text-sky-200/90 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sky-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Final & Irreversible Action
        </div>
        <p className="leading-relaxed text-[11px] text-sky-200/80">
          Upon clicking <strong>Seal & Cast Ballot</strong>, your ballot will be encrypted with AES-256-GCM using the 2-of-3 trustee public keys, timestamped with hourly rounding, and anonymously registered in the isolated national ballot box.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <Lock className="w-3.5 h-3.5 text-cyan-400" />
        Zero-Knowledge Cryptographic Isolation Active
      </div>
    </div>
  );
};
