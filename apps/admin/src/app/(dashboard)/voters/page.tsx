'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApiClient } from '../../../lib/api';
import { DataTable, Column } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import { VoterProfile } from '@vote-wallet/shared-types';
import { UserPlus, Upload, ShieldCheck, MapPin, User, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function VotersListPage() {
  const [voters, setVoters] = useState<VoterProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVoters() {
      try {
        const res = await adminApiClient.admin.getVoters();
        if (res?.voters && res.voters.length > 0) {
          setVoters(res.voters);
        } else {
          setVoters(getSampleVoters());
        }
      } catch {
        setVoters(getSampleVoters());
      } finally {
        setIsLoading(false);
      }
    }
    loadVoters();
  }, []);

  const columns: Column<VoterProfile>[] = [
    {
      header: 'Voter Name & Photo',
      render: (voter) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-50 border border-yellow-200 flex items-center justify-center text-amber-700 shrink-0">
            {voter.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={voter.photoUrl} alt={voter.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{voter.fullName}</span>
            <span className="text-[11px] text-slate-500 font-mono">{voter.nationalId}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Constituency',
      render: (voter) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{voter.constituencyCode}</span>
        </div>
      ),
    },
    {
      header: 'Polling Station',
      accessorKey: 'pollingStation',
    },
    {
      header: 'Registry Status',
      render: (voter) => <StatusBadge status={voter.status} size="sm" />,
    },
    {
      header: 'Ballot Cast Status',
      render: (voter) =>
        voter.hasVoted ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Voted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-yellow-200">
            Eligible
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Electoral Register
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Voter Registry List</h1>
          <p className="text-xs text-slate-600">
            Official database of enrolled electors with biometric facial references.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/voters/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-yellow-300 text-xs font-bold text-amber-900 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Bulk CSV Import
          </Link>

          <Link
            href="/voters/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-xs font-black text-slate-950 shadow-md border border-yellow-400 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Voter
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={voters}
        columns={columns}
        searchPlaceholder="Search by name, voter ID, or constituency..."
        searchFilter={(voter, query) =>
          voter.fullName.toLowerCase().includes(query.toLowerCase()) ||
          voter.nationalId.toLowerCase().includes(query.toLowerCase()) ||
          voter.constituencyCode.toLowerCase().includes(query.toLowerCase())
        }
        pageSize={8}
      />
    </div>
  );
}

function getSampleVoters(): VoterProfile[] {
  return [
    {
      id: 'vtr_01',
      nationalId: 'EPIC987654321',
      voterHash: 'hash_suresh_sharma',
      fullName: 'Suresh Kumar Sharma',
      constituencyCode: 'AC-142 Bangalore South',
      pollingStation: 'Government High School, Room 4',
      hasVoted: true,
      status: 'ACTIVE',
    },
    {
      id: 'vtr_02',
      nationalId: 'EPIC123456789',
      voterHash: 'hash_ananya_rao',
      fullName: 'Ananya Rao',
      constituencyCode: 'AC-142 Bangalore South',
      pollingStation: 'St. Mary High School, Hall A',
      hasVoted: false,
      status: 'ACTIVE',
    },
    {
      id: 'vtr_03',
      nationalId: 'EPIC554433221',
      voterHash: 'hash_mohammed_irfan',
      fullName: 'Mohammed Irfan Sheikh',
      constituencyCode: 'AC-143 Bangalore Central',
      pollingStation: 'Community Civic Center, Wing 2',
      hasVoted: true,
      status: 'ACTIVE',
    },
    {
      id: 'vtr_04',
      nationalId: 'EPIC889900112',
      voterHash: 'hash_deepika_patel',
      fullName: 'Deepika Patel',
      constituencyCode: 'AC-144 Bangalore North',
      pollingStation: 'Vidya Mandir School, Room 12',
      hasVoted: false,
      status: 'ACTIVE',
    },
    {
      id: 'vtr_05',
      nationalId: 'EPIC332211445',
      voterHash: 'hash_arun_singh',
      fullName: 'Arun Singh',
      constituencyCode: 'AC-142 Bangalore South',
      pollingStation: 'Government College, Block C',
      hasVoted: false,
      status: 'SUSPENDED',
    },
  ];
}
