'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/StatusBadge';
import { Election } from '@vote-wallet/shared-types';
import { formatDate } from '../../../lib/utils';
import { Vote, Plus, ArrowRight, Calendar, Users, Award } from 'lucide-react';

export default function ElectionsListPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadElections() {
      try {
        const res = await adminApiClient.admin.getElections();
        if (res && res.length > 0) {
          setElections(res);
        } else {
          setElections(getSampleElections());
        }
      } catch {
        setElections(getSampleElections());
      } finally {
        setIsLoading(false);
      }
    }
    loadElections();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Electoral Calendar
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Elections Directory</h1>
          <p className="text-xs text-slate-600">
            Active, scheduled, and concluded national and state elections.
          </p>
        </div>

        <Link
          href="/elections/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-xs font-black text-slate-950 shadow-md border border-yellow-400 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Election
        </Link>
      </div>

      {/* Elections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {elections.map((election) => (
          <div
            key={election.id}
            className="rounded-3xl admin-card border border-yellow-200 hover:border-yellow-400 p-6 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-warm-card bg-white"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 font-mono">
                  {election.type}
                </span>
                <StatusBadge status={election.status} size="sm" />
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">{election.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{election.description}</p>
            </div>

            <div className="rounded-2xl bg-amber-50/70 p-3.5 border border-yellow-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Polls Open:
                </span>
                <span className="font-mono">{formatDate(election.startTime)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Polls Close:
                </span>
                <span className="font-mono">{formatDate(election.endTime)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-yellow-200">
                <span className="text-slate-600 text-[11px]">Constituencies:</span>
                <span className="font-bold text-slate-900">
                  {election.constituencyCodes?.join(', ') || 'Nationwide'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href={`/candidates?electionId=${election.id}`}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-amber-800 transition-colors font-semibold"
              >
                <Award className="w-3.5 h-3.5" />
                View Slate Candidates
              </Link>

              <Link
                href={`/elections/${election.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Console & Actions
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSampleElections(): Election[] {
  return [
    {
      id: 'elec_2026_national_general',
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
    },
    {
      id: 'elec_2026_state_council',
      title: '2026 State Legislative Assembly Election',
      description: 'State assembly election determining legislative representation.',
      type: 'LOCAL',
      status: 'SCHEDULED',
      startTime: '2026-11-05T07:00:00.000Z',
      endTime: '2026-11-05T18:00:00.000Z',
      constituencyCodes: ['KA-01', 'KA-02'],
      totalEligibleVoters: 850000,
      candidateCount: 8,
      createdAt: '2026-10-10T00:00:00.000Z',
      updatedAt: '2026-10-10T00:00:00.000Z',
    },
  ];
}
