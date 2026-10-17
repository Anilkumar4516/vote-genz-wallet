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
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Elections Directory
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            Official Certified Outcome
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Decrypted Election Tally
          </h1>
          <p className="text-xs text-slate-400">{tally.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="TALLIED" size="md" />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-200 hover:bg-surface-100 border border-slate-700 text-xs font-semibold text-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Gazette
          </button>
        </div>
      </div>

      {/* Mathematical Parity Proof Box */}
      <div className="p-5 rounded-3xl admin-card border border-emerald-500/40 bg-emerald-950/20 shadow-glow-emerald flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Cryptographic Balance Verified: N(Ballots) &equiv; N(Participations)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Exact mathematical match: <strong>{tally.totalBallotsCast.toLocaleString()}</strong> sealed ballots = <strong>{tally.totalParticipations.toLocaleString()}</strong> voter participations. Zero phantom ballots detected.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shrink-0">
          PARITY CONFIRMED
        </div>
      </div>

      {/* Candidate Vote Share Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Decrypted Candidate Vote Distribution
        </h3>

        {tally.results.map((candidate, idx) => (
          <div
            key={candidate.candidateId}
            className={`p-5 rounded-2xl admin-card border transition-all ${
              candidate.isWinner
                ? 'border-cyan-400/50 bg-cyan-950/20 shadow-glow-cyan'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    candidate.isWinner
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-surface-200 text-slate-400 border border-slate-700'
                  }`}
                >
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-white">
                      {candidate.candidateName}
                    </h4>
                    {candidate.isWinner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        <Award className="w-3 h-3 text-cyan-400" />
                        ELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{candidate.partyName}</p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-lg font-black text-white">
                  {candidate.votes.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-cyan-400 ml-2">
                  ({candidate.percentage}%)
                </span>
              </div>
            </div>

            {/* Percentage Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  candidate.isWinner
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    : 'bg-slate-500'
                }`}
                style={{ width: `${candidate.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Merkle Certificate Footer */}
      <div className="rounded-2xl admin-card border border-slate-800 p-4 text-xs font-mono space-y-1.5 text-slate-400">
        <div className="flex items-center justify-between">
          <span>Merkle Root Hash Certification:</span>
          <span className="text-cyan-400 truncate max-w-sm">{tally.merkleRoot}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tallied At:</span>
          <span className="text-slate-200">{tally.talliedAt}</span>
        </div>
      </div>
    </div>
  );
}
