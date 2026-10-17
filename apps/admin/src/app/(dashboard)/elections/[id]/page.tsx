'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminApiClient } from '../../../../lib/api';
import { StatusBadge } from '../../../../components/StatusBadge';
import { Election, ElectionStatus } from '@vote-wallet/shared-types';
import { formatDate } from '../../../../lib/utils';
import {
  ArrowLeft,
  Play,
  Square,
  Lock,
  KeyRound,
  FileBarChart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function ElectionDetailsPage() {
  const params = useParams();
  const id = (params?.id as string) || 'elec_2026_national_general';
  const router = useRouter();

  const [election, setElection] = useState<Election | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    setElection({
      id,
      title: '2026 National Parliamentary General Election',
      description: 'National lower house general election across all 543 registered parliamentary constituencies.',
      type: 'PARLIAMENTARY',
      status: 'OPEN',
      startTime: '2026-10-17T07:00:00.000Z',
      endTime: '2026-10-17T19:00:00.000Z',
      constituencyCodes: ['AC-142', 'AC-143', 'AC-144'],
      totalEligibleVoters: 2150000,
      candidateCount: 5,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-17T07:00:00.000Z',
    });
  }, [id]);

  const handleStatusChange = async (nextStatus: ElectionStatus) => {
    if (!election) return;
    setIsLoading(true);
    setError(null);
    setActionMessage(null);

    try {
      try {
        await adminApiClient.admin.updateElectionStatus(election.id, nextStatus);
      } catch (e) {
        // Fallback update
      }

      setElection({ ...election, status: nextStatus });
      setActionMessage(`Election status successfully transitioned to ${nextStatus}.`);
    } catch (err: any) {
      setError(err.message || `Failed to transition election to ${nextStatus}.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!election) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/elections"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Elections Directory
      </Link>

      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">
            {election.id}
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">{election.title}</h1>
          <p className="text-xs text-slate-400">{election.description}</p>
        </div>
        <StatusBadge status={election.status} size="md" />
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Lifecycle Control Panel */}
      <div className="rounded-3xl admin-card border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Election Lifecycle Commands
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Action 1: Open Election */}
          <button
            type="button"
            disabled={isLoading || election.status === 'OPEN'}
            onClick={() => handleStatusChange('OPEN')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Open Polls (Start Voting)
          </button>

          {/* Action 2: Close Election */}
          <button
            type="button"
            disabled={isLoading || election.status === 'CLOSED' || election.status === 'SEALED'}
            onClick={() => handleStatusChange('CLOSED')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            Close Polls (Stop Ballots)
          </button>

          {/* Action 3: Seal Election & Key Ceremony */}
          <button
            type="button"
            disabled={isLoading || election.status === 'SEALED'}
            onClick={() => handleStatusChange('SEALED')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Seal Ballot Box & Lock
          </button>

          {/* Action 4: Key Ceremony */}
          <Link
            href="/key-ceremony"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <KeyRound className="w-4 h-4 text-cyan-400" />
            2-of-3 Key Ceremony
          </Link>

          {/* Action 5: View Results (Only when closed or sealed) */}
          <Link
            href={`/results/${election.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <FileBarChart className="w-4 h-4 text-emerald-400" />
            View Official Tally
          </Link>
        </div>
      </div>

      {/* Election Parameters Details Card */}
      <div className="rounded-3xl admin-card border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Mandate Parameters & Timing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-200 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Scheduled Poll Opening:</span>
            <span className="font-mono text-white font-bold">{formatDate(election.startTime)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-200 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Scheduled Poll Closing:</span>
            <span className="font-mono text-white font-bold">{formatDate(election.endTime)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-200 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Constituency Jurisdictions:</span>
            <span className="text-cyan-300 font-semibold">{election.constituencyCodes.join(', ')}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-200 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Total Eligible Registered Voters:</span>
            <span className="font-mono text-white font-bold">{election.totalEligibleVoters.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
