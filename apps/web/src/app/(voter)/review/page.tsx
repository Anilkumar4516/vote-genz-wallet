'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReviewSummary } from '../../../components/voting/ReviewSummary';
import { Button } from '../../../components/ui/Button';
import { useVoteFlowStore } from '../../../store/vote-flow.store';
import { useCastVote } from '../../../features/voting/useCastVote';
import { useI18n } from '../../../lib/i18n/config';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const { selectedCandidate } = useVoteFlowStore();
  const { castBallot, isCasting, error } = useCastVote();
  const { t } = useI18n();

  // If voter landed here directly without candidate selection, redirect to ballot
  if (!selectedCandidate) {
    return (
      <div className="text-center p-12 space-y-4 max-w-md mx-auto">
        <p className="text-sm text-slate-300">No candidate selected for review.</p>
        <Link href="/ballot">
          <Button variant="primary">Return to Ballot</Button>
        </Link>
      </div>
    );
  }

  const handleCast = async () => {
    await castBallot();
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <Link
        href="/ballot"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('review.back')}
      </Link>

      <ReviewSummary candidate={selectedCandidate} />

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Final Cast Button */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={handleCast}
          isLoading={isCasting}
          variant="accent"
          size="lg"
          className="w-full"
          leftIcon={<Lock className="w-5 h-5" />}
        >
          {isCasting ? 'Sealing Ballot with Trustee Keys...' : t('review.castButton')}
        </Button>

        <p className="text-[11px] text-slate-500 text-center">
          By casting, you acknowledge that your vote is final, irreversible, and anonymously sealed.
        </p>
      </div>
    </div>
  );
}
