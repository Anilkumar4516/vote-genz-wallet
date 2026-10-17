'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAdminAuthStore } from '../../store/admin-auth.store';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Vote,
  Award,
  KeyRound,
  FileText,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAdminAuthStore();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      exact: true,
      roles: ['SUPER_ADMIN', 'COMMISSIONER', 'AUDITOR', 'OPERATOR'],
    },
    {
      label: 'Voter Registry',
      href: '/voters',
      icon: Users,
      exact: false,
      roles: ['SUPER_ADMIN', 'COMMISSIONER', 'OPERATOR'],
    },
    {
      label: 'Elections',
      href: '/elections',
      icon: Vote,
      exact: false,
      roles: ['SUPER_ADMIN', 'COMMISSIONER', 'AUDITOR'],
    },
    {
      label: 'Candidates',
      href: '/candidates',
      icon: Award,
      exact: false,
      roles: ['SUPER_ADMIN', 'COMMISSIONER', 'OPERATOR'],
    },
    {
      label: 'Key Ceremony',
      href: '/key-ceremony',
      icon: KeyRound,
      exact: false,
      roles: ['SUPER_ADMIN', 'COMMISSIONER'],
    },
    {
      label: 'Audit Ledger',
      href: '/audit',
      icon: FileText,
      exact: true,
      roles: ['SUPER_ADMIN', 'COMMISSIONER', 'AUDITOR'],
    },
    {
      label: 'Verify Hash-Chain',
      href: '/audit/verify',
      icon: CheckCircle2,
      exact: true,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role),
  );

  return (
    <aside className="w-64 border-r border-yellow-200 bg-white/95 flex flex-col shrink-0 min-h-screen shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-yellow-200 flex items-center gap-3 bg-amber-50/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 border border-yellow-400 flex items-center justify-center text-slate-900 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-sm text-slate-900 tracking-wide block">
            VOTE WALLET
          </span>
          <span className="text-[10px] text-amber-700 font-mono font-bold tracking-wider block">
            COMMISSION CONSOLE
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
          Operations
        </span>

        {filteredNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-amber-100 text-amber-900 border border-yellow-300 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/80',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-amber-700' : 'text-slate-500',
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security Status Box in Sidebar */}
      <div className="p-4 border-t border-yellow-200 text-[11px] text-slate-600">
        <div className="p-3 rounded-xl bg-amber-50/80 border border-yellow-200 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <Lock className="w-3.5 h-3.5" />
            Dual-DB Isolation Active
          </div>
          <p className="text-[10px] text-slate-600">
            Ballot Box DB credentials physically segregated from Voter Registry.
          </p>
        </div>
      </div>
    </aside>
  );
};
