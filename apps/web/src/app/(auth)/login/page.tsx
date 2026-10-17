'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageShell } from '../../../components/layout/PageShell';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useLogin } from '../../../features/auth/useLogin';
import { useI18n } from '../../../lib/i18n/config';
import { Shield, Phone, CreditCard, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const { initiateLogin, isLoading, error } = useLogin();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId.trim()) return;
    await initiateLogin(nationalId, phone);
  };

  return (
    <PageShell glow className="py-8 sm:py-16">
      <Card variant="glass" glow="cyan" className="w-full max-w-md p-6 sm:p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1 shadow-glow-cyan">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">{t('login.header')}</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {t('login.desc')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('login.voterIdLabel')}
            placeholder="e.g. VOTE987654321"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.toUpperCase())}
            required
            autoFocus
            leftIcon={<CreditCard className="w-4 h-4" />}
            helperText="Found on your national voter photo identity card (EPIC)"
          />

          <Input
            label={t('login.phoneLabel')}
            placeholder="e.g. +91 98765 43210 (Optional if enrolled)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('login.submit')}
          </Button>
        </form>

        {/* Demo Fast-fill Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Quick Demo Citizens
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setNationalId('EPIC987654321');
                setPhone('+919876543210');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-50 text-cyan-300 border border-slate-700 transition-colors"
            >
              Citizen 1: Suresh Sharma
            </button>
            <button
              type="button"
              onClick={() => {
                setNationalId('EPIC123456789');
                setPhone('+919812345678');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-50 text-cyan-300 border border-slate-700 transition-colors"
            >
              Citizen 2: Ananya Rao
            </button>
          </div>
        </div>

        {/* Help footer */}
        <div className="mt-6 flex items-start gap-2 text-[11px] text-slate-400">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{t('login.help')}</span>
        </div>
      </Card>
    </PageShell>
  );
}
