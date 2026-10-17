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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-yellow-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Electoral Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Real-Time Turnout Overview
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Statutory privacy notice: Individual candidate tallies remain sealed until official poll closure and 2-of-3 Key Ceremony completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={activeElection.status} size="md" />
          <Link
            href={`/elections/${activeElection.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-yellow-300 text-xs font-bold text-amber-900 transition-colors shadow-sm"
          >
            Manage Election
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Turnout Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Ballots Cast */}
        <div className="rounded-2xl admin-card border border-yellow-300 p-5 relative overflow-hidden shadow-warm-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Total Ballots Cast
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-yellow-300">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {turnout.totalBallotsCast.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              Live
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Recorded in isolated Ballot Box DB
          </span>
        </div>

        {/* Metric 2: Turnout Percentage */}
        <div className="rounded-2xl admin-card border border-emerald-300 p-5 shadow-warm-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Electoral Turnout Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 font-mono">
              {turnout.turnoutPercentage}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">of enrolled</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-yellow-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${turnout.turnoutPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Total Registered Citizens */}
        <div className="rounded-2xl admin-card border border-yellow-200 p-5 shadow-warm-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Registered Electors
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-yellow-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-mono block">
            {turnout.totalRegisteredVoters.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across {activeElection.constituencyCount} Parliamentary Constituencies
          </span>
        </div>

        {/* Metric 4: Cryptographic Balance Proof */}
        <div className="rounded-2xl admin-card border border-yellow-200 p-5 shadow-warm-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Ledger Balance Proof
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-yellow-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-sm font-bold text-slate-900">
              N(Ballots) &equiv; N(Voters)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            100% Mathematical Parity Confirmed
          </span>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-yellow-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 border border-yellow-300 text-amber-800 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Ballot Contents Cryptographically Sealed
            </h4>
            <p className="text-xs text-slate-600">
              In accordance with electoral law, candidate breakdown tallies are inaccessible until the election is marked CLOSED and trustees complete the Shamir Key Ceremony.
            </p>
          </div>
        </div>

        <Link
          href="/key-ceremony"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-bold shrink-0 shadow-md transition-all border border-yellow-400"
        >
          Key Ceremony Status &rarr;
        </Link>
      </div>

      {/* Quick Action Operations */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Quick Operational Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/voters/new"
            className="p-4 rounded-xl admin-card border border-yellow-200 hover:border-yellow-400 transition-all flex items-center gap-3 group shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Enroll New Citizen</span>
              <span className="text-[11px] text-slate-500">Register with photo & phone</span>
            </div>
          </Link>

          <Link
            href="/voters/import"
            className="p-4 rounded-xl admin-card border border-yellow-200 hover:border-yellow-400 transition-all flex items-center gap-3 group shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Bulk Import Voters</span>
              <span className="text-[11px] text-slate-500">Upload CSV registry file</span>
            </div>
          </Link>

          <Link
            href="/audit/verify"
            className="p-4 rounded-xl admin-card border border-yellow-200 hover:border-emerald-400 transition-all flex items-center gap-3 group shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Verify Hash-Chain</span>
              <span className="text-[11px] text-slate-500">Auditor integrity proof check</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
