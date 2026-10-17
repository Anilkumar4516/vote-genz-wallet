'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useVoteFlowStore } from '../../store/vote-flow.store';
import { useI18n } from '../../lib/i18n/config';
import { ShieldCheck, Lock, Trash2, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ConsentPage() {
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();
  const { setConsent, setStep } = useVoteFlowStore();
  const { t } = useI18n();

  const handleAgree = () => {
    setConsent(true);
    setStep('VERIFY_FACE');
    router.push('/verify/face');
  };

  const handleDecline = () => {
    router.push('/');
  };

  return (
    <PageShell glow className="py-8 sm:py-16">
      <Card variant="glass" glow="cyan" className="w-full max-w-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1 shadow-glow-cyan">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">{t('consent.header')}</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            {t('consent.desc')}
          </p>
        </div>

        {/* Legal & Privacy Guarantees */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-100 border border-slate-800">
            <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block mb-0.5">Volatile RAM Decryption Only</span>
              <p className="text-slate-400">{t('consent.bullet1')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-100 border border-slate-800">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block mb-0.5">Zero-Knowledge Data Isolation</span>
              <p className="text-slate-400">{t('consent.bullet2')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-100 border border-slate-800">
            <Trash2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block mb-0.5">Statutory 24h Template Purge</span>
              <p className="text-slate-400">{t('consent.bullet3')}</p>
            </div>
          </div>
        </div>

        {/* Checkbox agreement */}
        <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-200/80 border border-slate-700/80 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 bg-surface-100 border-slate-600 focus:ring-cyan-400 mt-0.5 cursor-pointer"
          />
          <span className="text-xs text-slate-200 font-medium">
            I confirm that I am the registered citizen named on this electoral profile and give informed consent for volatile biometric verification for the 2026 General Election.
          </span>
        </label>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleDecline}
            variant="ghost"
            size="md"
            className="flex-1"
          >
            {t('consent.decline')}
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!isChecked}
            variant="primary"
            size="md"
            className="flex-1"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('consent.agree')}
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
