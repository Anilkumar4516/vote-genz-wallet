'use client';

import React from 'react';
import { Candidate } from '@vote-wallet/shared-types';
import { Check, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (candidate: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(candidate)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect(candidate);
        }
      }}
      className={cn(
        'group relative w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none',
        isSelected
          ? 'bg-cyan-950/30 border-cyan-400 shadow-glow-cyan ring-1 ring-cyan-400/50'
          : 'bg-surface-200/80 hover:bg-surface-100/90 border-slate-800 hover:border-slate-700',
      )}
    >
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        {/* Ballot Number Badge */}
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-base font-black transition-colors',
            isSelected
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'bg-surface-100 group-hover:bg-surface-50 text-slate-300 border border-slate-700',
          )}
        >
          #{candidate.ballotNumber}
        </div>

        {/* Candidate Avatar / Party Logo */}
        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border border-slate-700 bg-surface-300 flex items-center justify-center">
          {candidate.partyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.partyLogoUrl}
              alt={candidate.partyName}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-slate-400" />
          )}
        </div>

        {/* Name and Party Affiliation */}
        <div className="min-w-0">
          <h4
            className={cn(
              'truncate text-base font-bold transition-colors',
              isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white',
            )}
          >
            {candidate.fullName}
          </h4>
          <p className="truncate text-xs font-semibold text-cyan-400/90 mt-0.5">
            {candidate.partyName}
          </p>
          {candidate.biography && (
            <p className="hidden sm:block truncate text-[11px] text-slate-400 mt-1 max-w-md">
              {candidate.biography}
            </p>
          )}
        </div>
      </div>

      {/* Custom Radio Button */}
      <div className="ml-4 shrink-0">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200',
            isSelected
              ? 'border-cyan-400 bg-cyan-500 text-slate-950 scale-105 shadow-md'
              : 'border-slate-600 bg-surface-100 group-hover:border-slate-500',
          )}
        >
          {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
        </div>
      </div>
    </div>
  );
};
