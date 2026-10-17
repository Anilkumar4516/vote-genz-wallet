'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '../../lib/i18n/config';
import { ShieldCheck, Lock, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full border-t border-slate-900 bg-surface-500 py-8 text-xs text-slate-400 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Security Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              AES-256-GCM Zero-Knowledge
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200 border border-slate-800 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              ArcFace Volatile RAM Liveness
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200 border border-slate-800 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Dual-DB Citizen Isolation
            </span>
          </div>

          {/* Nav / Links */}
          <div className="flex items-center gap-5">
            <Link
              href="/check-receipt"
              className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
            >
              {t('nav.verifyReceipt')}
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/consent"
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy & Consent
            </Link>
            <span className="text-slate-700">•</span>
            <a
              href="http://localhost:3002/audit/verify-chain"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
            >
              {t('nav.auditLedger')}
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2026 National Electoral Commission. All rights reserved.</p>
          <p>Vote Wallet Protocol v2.0 • Merkle Tree Proof Enabled</p>
        </div>
      </div>
    </footer>
  );
};
