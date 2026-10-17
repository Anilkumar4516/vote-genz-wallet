'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/auth.store';
import { useVoteFlowStore } from '../../../store/vote-flow.store';
import { VoterIdentityCard } from '../../../components/identity/VoterIdentityCard';
import { Button } from '../../../components/ui/Button';
import { useI18n } from '../../../lib/i18n/config';
import { ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function IdentityPage() {
  const router = useRouter();
  const { voterProfile } = useAuthStore();
  const { setStep } = useVoteFlowStore();
  const { t } = useI18n();

  // Fallback demo profile if direct navigation
  const profile = voterProfile || {
    id: 'vtr_demo_01',
    nationalId: 'EPIC987654321',
    voterHash: 'a8b1c4d9e2f30129',
    fullName: 'Suresh Kumar Sharma',
    constituencyCode: 'AC-142 Bangalore South',
    pollingStation: 'Government High School, Room 4',
    hasVoted: false,
    status: 'ACTIVE' as const,
  };

  const handleProceed = () => {
    setStep('CONSENT');
    router.push('/consent');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Step 2 of 5 • Identity Confirmation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{t('identity.header')}</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {t('identity.desc')}
        </p>
      </div>

      <VoterIdentityCard profile={profile} />

      {profile.hasVoted && (
        <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/50 text-sky-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-sky-400 shrink-0" />
          <span>
            A ballot has already been recorded for this voter ID in the current election cycle. Duplicate votes are strictly blocked.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Electoral Registry Record Verified</span>
        </div>

        <Button
          onClick={handleProceed}
          disabled={profile.hasVoted}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t('identity.proceed')}
        </Button>
      </div>
    </div>
  );
}
