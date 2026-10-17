'use client';

import React from 'react';
import Link from 'next/link';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import { useVoteFlowStore } from '../../store/vote-flow.store';
import { AlertOctagon, RotateCcw, Home, HelpCircle } from 'lucide-react';

export default function ErrorPage() {
  const { logout } = useAuthStore();
  const { resetFlow } = useVoteFlowStore();

  const handleReset = () => {
    resetFlow();
    logout();
  };

  return (
    <PageShell glow className="py-12 sm:py-20">
      <Card variant="glass" glow="none" className="w-full max-w-md p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/20">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Electoral System Notice</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            An authentication anomaly, session timeout, or integrity check error was detected in your voting session.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-100 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
          <p className="font-semibold text-white">Security Protections Applied:</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>Any uncast or partial session tokens have been invalidated.</li>
            <li>No vote was recorded from this session.</li>
            <li>Your national electoral eligibility remains intact.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="flex-1">
            <Button
              onClick={handleReset}
              variant="secondary"
              size="md"
              className="w-full"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Return Home
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button
              onClick={handleReset}
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Retry Login
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          For assistance, contact Electoral Helpdesk: 1800-VOTE-WALLET
        </div>
      </Card>
    </PageShell>
  );
}
