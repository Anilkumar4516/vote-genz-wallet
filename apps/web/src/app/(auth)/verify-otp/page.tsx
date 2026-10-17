'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '../../../components/layout/PageShell';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useVerifyOtp } from '../../../features/auth/useVerifyOtp';
import { useAuthStore } from '../../../store/auth.store';
import { useCountdown } from '../../../hooks/useCountdown';
import { useI18n } from '../../../lib/i18n/config';
import { KeyRound, ArrowRight, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const { confirmOtp, isLoading, error } = useVerifyOtp();
  const { maskedPhone, nationalId } = useAuthStore();
  const { secondsLeft, formattedTime, isActive, start, reset } = useCountdown(120);
  const { t } = useI18n();

  useEffect(() => {
    start();
  }, [start]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    await confirmOtp(otp);
  };

  const handleResend = () => {
    reset(120);
    start();
  };

  return (
    <PageShell glow className="py-8 sm:py-16">
      <Card variant="glass" glow="cyan" className="w-full max-w-md p-6 sm:p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Voter ID
        </Link>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1 shadow-glow-cyan">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">{t('otp.header')}</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {t('otp.desc')} <span className="text-cyan-300 font-mono font-bold">{maskedPhone || '••• 210'}</span>
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
              {t('otp.codeLabel')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              required
              autoFocus
              className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 px-4 rounded-xl glass-input border border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white"
            />
          </div>

          {/* Quick Fill Test Code */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setOtp('123456')}
              className="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline"
            >
              Demo Auto-Fill Passcode: 123456
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={otp.length < 4}
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('otp.verify')}
          </Button>
        </form>

        {/* Resend and Countdown */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          {isActive ? (
            <p>
              {t('otp.resend')}{' '}
              <span className="font-mono text-cyan-400 font-bold">{formattedTime}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('otp.resendNow')}
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Encrypted SMS Dispatch via National Gateway
        </div>
      </Card>
    </PageShell>
  );
}
