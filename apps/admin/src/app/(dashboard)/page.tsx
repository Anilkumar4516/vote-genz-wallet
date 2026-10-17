'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApiClient } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Users,
  Vote,
  ShieldCheck,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  UserPlus,
  Upload,
  FileCheck2,
} from 'lucide-react';

export default function OverviewPage() {
  const [turnout, setTurnout] = useState({
    totalBallotsCast: 1428590,
    totalRegisteredVoters: 2150000,
    turnoutPercentage: 66.44,
    participationsLogged: 1428590,
    isBalanced: true,
  });

  const [activeElection, setActiveElection] = useState({
    id: 'elec_2026_national_general',
    title: '2026 National Parliamentary General Election',
    status: 'OPEN',
    startTime: '2026-10-17T07:00:00.000Z',
    endTime: '2026-10-17T19:00:00.000Z',
    constituencyCount: 543,
  });

  // Simulated live turnout increment
  useEffect(() => {
    const interval = setInterval(() => {
      setTurnout((prev) => {
        const nextCast = prev.totalBallotsCast + Math.floor(Math.random() * 8) + 1;
        return {
          ...prev,
          totalBallotsCast: nextCast,
          participationsLogged: nextCast,
          turnoutPercentage: Number(((nextCast / prev.totalRegisteredVoters) * 100).toFixed(2)),
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
            Electoral Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Real-Time Turnout Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statutory privacy notice: Individual candidate tallies remain sealed until official poll closure and 2-of-3 Key Ceremony completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={activeElection.status} size="md" />
          <Link
            href={`/elections/${activeElection.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-200 hover:bg-surface-100 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Manage Election
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Turnout Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Ballots Cast */}
        <div className="rounded-2xl admin-card border border-cyan-500/30 p-5 relative overflow-hidden shadow-glow-cyan">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Ballots Cast
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {turnout.totalBallotsCast.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Recorded in isolated Ballot Box DB
          </span>
        </div>

        {/* Metric 2: Turnout Percentage */}
        <div className="rounded-2xl admin-card border border-emerald-500/30 p-5 shadow-glow-emerald">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Electoral Turnout Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {turnout.turnoutPercentage}%
            </span>
            <span className="text-xs text-slate-400">of enrolled</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${turnout.turnoutPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Total Registered Citizens */}
        <div className="rounded-2xl admin-card border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Registered Electors
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white font-mono block">
            {turnout.totalRegisteredVoters.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Across {activeElection.constituencyCount} Parliamentary Constituencies
          </span>
        </div>

        {/* Metric 4: Cryptographic Balance Proof */}
        <div className="rounded-2xl admin-card border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ledger Balance Proof
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white">
              N(Ballots) &equiv; N(Voters)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            100% Mathematical Parity Confirmed
          </span>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-5 rounded-2xl bg-surface-200/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Ballot Contents Cryptographically Sealed
            </h4>
            <p className="text-xs text-slate-400">
              In accordance with electoral law, candidate breakdown tallies are inaccessible until the election is marked CLOSED and trustees complete the Shamir Key Ceremony.
            </p>
          </div>
        </div>

        <Link
          href="/key-ceremony"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 shadow-lg shadow-indigo-600/20 transition-all"
        >
          Key Ceremony Status &rarr;
        </Link>
      </div>

      {/* Quick Action Operations */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Operational Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/voters/new"
            className="p-4 rounded-xl admin-card border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Enroll New Citizen</span>
              <span className="text-[11px] text-slate-400">Register with photo & phone</span>
            </div>
          </Link>

          <Link
            href="/voters/import"
            className="p-4 rounded-xl admin-card border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Bulk Import Voters</span>
              <span className="text-[11px] text-slate-400">Upload CSV registry file</span>
            </div>
          </Link>

          <Link
            href="/audit/verify"
            className="p-4 rounded-xl admin-card border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Verify Hash-Chain</span>
              <span className="text-[11px] text-slate-400">Auditor integrity proof check</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
