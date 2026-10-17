'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth.store';
import { useI18n, LOCALE_LABELS, SupportedLocale } from '../../lib/i18n/config';
import { Shield, Globe, LogOut, User, CheckCircle2 } from 'lucide-react';
import { maskNationalId } from '../../lib/utils';

export const Header: React.FC = () => {
  const { voterProfile, isAuthenticated, logout } = useAuthStore();
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-surface-400/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-emerald-500/20 border border-cyan-500/40 shadow-glow-cyan transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-base sm:text-lg">
                {t('app.title')}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
              {t('app.subtitle')}
            </p>
          </div>
        </Link>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative flex items-center">
            <Globe className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              aria-label="Language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as SupportedLocale)}
              className="appearance-none bg-surface-200/90 hover:bg-surface-100 text-xs text-slate-200 font-medium pl-8 pr-7 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
            >
              {(Object.keys(LOCALE_LABELS) as SupportedLocale[]).map((loc) => (
                <option key={loc} value={loc} className="bg-surface-200 text-white">
                  {LOCALE_LABELS[loc]}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Quick Check Receipt Link */}
          <Link
            href="/check-receipt"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-all font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            {t('nav.verifyReceipt')}
          </Link>

          {/* Active Voter Status Pill */}
          {isAuthenticated && voterProfile && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{voterProfile.fullName}</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {maskNationalId(voterProfile.nationalId)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                title="Logout / Exit Booth"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
