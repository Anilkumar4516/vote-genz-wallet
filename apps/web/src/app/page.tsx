'use client';

import React from 'react';
import Link from 'next/link';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useI18n } from '../lib/i18n/config';
import {
  ShieldCheck,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <PageShell glow className="py-12 sm:py-20 text-center">
      {/* Official State Ribbon */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-8 shadow-glow-cyan animate-pulse-subtle">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        Official Electoral Commission Digital Platform
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-3xl leading-[1.15]">
        Next-Generation <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Zero-Knowledge
        </span>{' '}
        Electoral Portal
      </h1>

      <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
        Cast your confidential vote with biometric facial liveness and hardware security. Your ballot is cryptographically unlinked from your citizen identity and mathematically verified on an immutable Merkle tree.
      </p>

      {/* Live Election Status Box */}
      <div className="mt-8 flex items-center justify-center gap-4 text-xs font-mono bg-surface-200/90 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-inner">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          POLLS ARE CURRENTLY OPEN
        </span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          General Parliamentary Election #2026
        </span>
      </div>

      {/* Primary Call to Actions */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <Link href="/login" className="w-full sm:w-auto flex-1">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Enter Voting Booth
          </Button>
        </Link>
        <Link href="/check-receipt" className="w-full sm:w-auto flex-1">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            leftIcon={<FileCheck className="w-4 h-4" />}
          >
            {t('nav.verifyReceipt')}
          </Button>
        </Link>
      </div>

      {/* Security Pillars Cards */}
      <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <Card variant="glass" glow="cyan">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Zero-Knowledge Ballots</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ballots contain zero citizen identifiers. Dual isolated databases ensure citizen participation is physically segregated from cast vote contents.
          </p>
        </Card>

        <Card variant="glass" glow="none">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Multi-Factor Biometrics</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive liveness blink verification and ArcFace normalized matching decrypts templates in volatile memory only. Statutory post-election purge cleanses all tokens.
          </p>
        </Card>

        <Card variant="glass" glow="emerald">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Merkle Audit Ledger</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every voter receives a cryptographic receipt code. Independent observers and citizens can mathematically verify inclusion without revealing candidate preference.
          </p>
        </Card>
      </div>

      {/* Turnout Banner */}
      <div className="mt-12 p-4 rounded-2xl glass-panel border border-slate-800 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            Over <strong>14.2 Million</strong> verified ballots successfully sealed in today&apos;s election.
          </span>
        </div>
        <Link
          href="http://localhost:3002/audit/verify-chain"
          target="_blank"
          className="text-cyan-400 hover:underline font-semibold"
        >
          View Public Hash-Chain Ledger &rarr;
        </Link>
      </div>
    </PageShell>
  );
}
