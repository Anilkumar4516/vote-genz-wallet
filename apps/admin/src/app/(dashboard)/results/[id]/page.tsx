'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StatusBadge } from '../../../../components/StatusBadge';
import {
  FileBarChart,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Download,
  Lock,
} from 'lucide-react';

export default function ElectionResultsPage() {
  const params = useParams();
  const id = (params?.id as string) || 'elec_2026_national_general';

  // State mimicking finalized post-key ceremony tally
  const [tally] = useState({
    electionId: id,
    title: '2026 National Parliamentary General Election',
    totalBallotsCast: 1428590,
    totalParticipations: 1428590,
    isBalanced: true,
    merkleRoot: '0x9a4f21b778e22c01d431c93f0b83b8a1c93a0b83b8a1c93a0b83b8a1c93a0b83',
    talliedAt: '2026-10-17 19:30:00 UTC',
    results: [
      {
        candidateId: 'cand_01',
        candidateName: 'Aarav Rajesh Verma',
        partyName: 'National Democratic Progressive Coalition',
        votes: 614293,
        percentage: 43.0,
        isWinner: true,
      },
      {
        candidateId: 'cand_02',
        candidateName: 'Priya Sundaram Naidu',
        partyName: "United Citizens People's Party",
        votes: 457148,
        percentage: 32.0,
        isWinner: false,
      },
      {
        candidateId: 'cand_03',
        candidateName: 'Vikramaditya Sengupta',
        partyName: 'Democratic Secular Alliance',
        votes: 214288,
        percentage: 15.0,
        isWinner: false,
      },
      {
        candidateId: 'cand_04',
        candidateName: 'Dr. Fatima Zahra Qureshi',
        partyName: 'Social Justice & Green Congress',
        votes: 114287,
        percentage: 8.0,
        isWinner: false,
      },
      {
        candidateId: 'cand_05',
        candidateName: 'None of the Above (NOTA)',
        partyName: 'Electoral Disapproval Option',
        votes: 28574,
        percentage: 2.0,
        isWinner: false,
      },
    ],
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/elections"
        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-800 font-bold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Elections Directory
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Official Certified Outcome
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Decrypted Election Tally
          </h1>
          <p className="text-xs text-slate-600">{tally.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="TALLIED" size="md" />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-yellow-300 text-xs font-bold text-amber-900 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Gazette
          </button>
        </div>
      </div>

      {/* Mathematical Parity Proof Box */}
      <div className="p-5 rounded-3xl admin-card border border-emerald-300 bg-emerald-50/50 shadow-warm-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Cryptographic Balance Verified: N(Ballots) &equiv; N(Participations)
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Exact mathematical match: <strong>{tally.totalBallotsCast.toLocaleString()}</strong> sealed ballots = <strong>{tally.totalParticipations.toLocaleString()}</strong> voter participations. Zero phantom ballots detected.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shrink-0 shadow-sm">
          PARITY CONFIRMED
        </div>
      </div>

      {/* Candidate Vote Share Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Decrypted Candidate Vote Distribution
        </h3>

        {tally.results.map((candidate, idx) => (
          <div
            key={candidate.candidateId}
            className={`p-5 rounded-2xl admin-card border transition-all shadow-warm-card ${
              candidate.isWinner
                ? 'border-amber-400 bg-amber-50/50'
                : 'border-yellow-200 bg-white'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    candidate.isWinner
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black'
                      : 'bg-amber-50 text-slate-600 border border-yellow-200'
                  }`}
                >
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900">
                      {candidate.candidateName}
                    </h4>
                    {candidate.isWinner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-300">
                        <Award className="w-3 h-3 text-amber-700" />
                        ELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{candidate.partyName}</p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-lg font-black text-slate-900">
                  {candidate.votes.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-700 ml-2">
                  ({candidate.percentage}%)
                </span>
              </div>
            </div>

            {/* Percentage Bar */}
            <div className="w-full h-2 bg-yellow-100 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  candidate.isWinner
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                    : 'bg-amber-300'
                }`}
                style={{ width: `${candidate.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Merkle Certificate Footer */}
      <div className="rounded-2xl admin-card border border-yellow-200 p-4 text-xs font-mono space-y-1.5 text-slate-600 bg-amber-50/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span>Merkle Root Hash Certification:</span>
          <span className="text-amber-800 font-bold truncate max-w-sm">{tally.merkleRoot}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tallied At:</span>
          <span className="text-slate-800 font-bold">{tally.talliedAt}</span>
        </div>
      </div>
    </div>
  );
}
