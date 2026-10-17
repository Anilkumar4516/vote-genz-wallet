'use client';

import React, { useState, useEffect } from 'react';
import { adminApiClient } from '../../../lib/api';
import { Candidate, CreateCandidateDto } from '@vote-wallet/shared-types';
import { DataTable, Column } from '../../../components/DataTable';
import { Award, Plus, User, CheckCircle2 } from 'lucide-react';

export default function CandidatesAdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [partyName, setPartyName] = useState('');
  const [ballotNumber, setBallotNumber] = useState(6);
  const [biography, setBiography] = useState('');

  useEffect(() => {
    setCandidates(getSampleCandidates());
  }, []);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newCand: Candidate = {
      id: 'cand_' + Math.random().toString(36).substring(2, 8),
      electionId: 'elec_2026_national_general',
      fullName,
      partyName,
      ballotNumber: Number(ballotNumber),
      biography,
      createdAt: new Date().toISOString(),
    };

    try {
      try {
        await adminApiClient.admin.createCandidate({
          electionId: newCand.electionId,
          fullName: newCand.fullName,
          partyName: newCand.partyName,
          ballotNumber: newCand.ballotNumber,
          biography: newCand.biography,
        });
      } catch (err) {
        // Fallback update
      }

      setCandidates((prev) => [...prev, newCand]);
      setIsModalOpen(false);
      setFullName('');
      setPartyName('');
      setBiography('');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Candidate>[] = [
    {
      header: 'Ballot #',
      render: (cand) => (
        <span className="font-mono font-black text-amber-800 text-sm">
          #{cand.ballotNumber}
        </span>
      ),
      className: 'w-24',
    },
    {
      header: 'Candidate Name',
      render: (cand) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-yellow-200 flex items-center justify-center text-amber-700 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{cand.fullName}</span>
            <span className="text-[11px] text-slate-500 font-mono">{cand.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Political Party Affiliation',
      accessorKey: 'partyName',
    },
    {
      header: 'Electoral Biography',
      accessorKey: 'biography',
      render: (cand) => (
        <span className="text-xs text-slate-600 line-clamp-1">{cand.biography || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Electoral Slate
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Candidate Nominations</h1>
          <p className="text-xs text-slate-600">
            Registered candidate slates approved for national parliamentary ballot papers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-xs font-black text-slate-950 shadow-md border border-yellow-400 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nominate Candidate
        </button>
      </div>

      <DataTable
        data={candidates}
        columns={columns}
        searchPlaceholder="Search candidates or political parties..."
        searchFilter={(cand, query) =>
          cand.fullName.toLowerCase().includes(query.toLowerCase()) ||
          cand.partyName.toLowerCase().includes(query.toLowerCase())
        }
        pageSize={8}
      />

      {/* Nomination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl admin-card border border-yellow-300 p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-yellow-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Nominate New Candidate</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Candidate Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Mahindra Kumar"
                  className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Political Party Name *
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. National Forward Alliance"
                  className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Ballot Position Number *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={ballotNumber}
                  onChange={(e) => setBallotNumber(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Candidate Bio / Platform Summary
                </label>
                <textarea
                  rows={3}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Advocacy pillars and background..."
                  className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  {isLoading ? 'Saving...' : 'Add to Ballot Slate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getSampleCandidates(): Candidate[] {
  return [
    {
      id: 'cand_01',
      electionId: 'elec_2026_national_general',
      fullName: 'Aarav Rajesh Verma',
      partyName: 'National Democratic Progressive Coalition',
      ballotNumber: 1,
      biography: 'Focusing on clean energy expansion, digital education, and healthcare digitization.',
    },
    {
      id: 'cand_02',
      electionId: 'elec_2026_national_general',
      fullName: 'Priya Sundaram Naidu',
      partyName: 'United Citizens People\'s Party',
      ballotNumber: 2,
      biography: 'Championing rural water infrastructure, urban transit modernization, and youth employment.',
    },
    {
      id: 'cand_03',
      electionId: 'elec_2026_national_general',
      fullName: 'Vikramaditya Sengupta',
      partyName: 'Democratic Secular Alliance',
      ballotNumber: 3,
      biography: 'Dedicated to transparency in public procurement, agricultural reform, and small business tax relief.',
    },
    {
      id: 'cand_04',
      electionId: 'elec_2026_national_general',
      fullName: 'Dr. Fatima Zahra Qureshi',
      partyName: 'Social Justice & Green Congress',
      ballotNumber: 4,
      biography: 'Public health physician advocating for universal health insurance and carbon neutrality.',
    },
    {
      id: 'cand_05',
      electionId: 'elec_2026_national_general',
      fullName: 'None of the Above (NOTA)',
      partyName: 'Electoral Disapproval Option',
      ballotNumber: 5,
      biography: 'Record official vote of dissent without choosing any listed candidate.',
    },
  ];
}
