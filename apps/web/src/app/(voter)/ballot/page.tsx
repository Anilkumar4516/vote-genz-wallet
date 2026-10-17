'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidates } from '../../../features/voting/useCandidates';
import { useVoteFlowStore } from '../../../store/vote-flow.store';
import { CandidateCard } from '../../../components/voting/CandidateCard';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useI18n } from '../../../lib/i18n/config';
import { Candidate } from '@vote-wallet/shared-types';
import { Search, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function BallotPage() {
  const { candidates, isLoading, error } = useCandidates();
  const { selectedCandidate, setSelectedCandidate, setStep } = useVoteFlowStore();
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { t } = useI18n();

  const filteredCandidates = candidates.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.partyName.toLowerCase().includes(search.toLowerCase()) ||
      String(c.ballotNumber).includes(search),
  );

  const handleSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleContinue = () => {
    if (!selectedCandidate) return;
    setStep('REVIEW');
    router.push('/review');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Step 4 of 5 • Official Candidate Slate
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{t('ballot.header')}</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {t('ballot.desc')}
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by candidate name, party, or ballot #"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400">Loading approved candidate slate...</p>
        </div>
      )}

      {/* Candidate Slate Cards */}
      {!isLoading && (
        <div className="space-y-3" role="radiogroup" aria-label="Candidate slate">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              onSelect={handleSelect}
            />
          ))}

          {filteredCandidates.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-surface-200">
              No candidates found matching &quot;{search}&quot;.
            </div>
          )}
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 p-4 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-2 text-xs">
          {selectedCandidate ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200">
                Selected: <strong>{selectedCandidate.fullName}</strong> (#{selectedCandidate.ballotNumber})
              </span>
            </>
          ) : (
            <span className="text-slate-400">
              Tap any candidate above to make your confidential selection.
            </span>
          )}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedCandidate}
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t('ballot.continue')}
        </Button>
      </div>
    </div>
  );
}
