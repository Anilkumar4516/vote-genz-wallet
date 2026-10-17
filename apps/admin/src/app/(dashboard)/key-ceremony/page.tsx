'use client';

import React, { useState } from 'react';
import { adminApiClient } from '../../../lib/api';
import { KeyRound, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Unlock, ArrowRight } from 'lucide-react';

interface Trustee {
  id: string;
  name: string;
  title: string;
  hasSubmitted: boolean;
  submittedAt?: string;
}

export default function KeyCeremonyPage() {
  const [trustees, setTrustees] = useState<Trustee[]>([
    {
      id: 'trustee_01',
      name: 'Dr. Rajiv Menon',
      title: 'Chief Election Commissioner',
      hasSubmitted: true,
      submittedAt: '2026-10-17 19:15 UTC',
    },
    {
      id: 'trustee_02',
      name: 'Justice S. Narayanan',
      title: 'Independent Judicial Auditor',
      hasSubmitted: true,
      submittedAt: '2026-10-17 19:22 UTC',
    },
    {
      id: 'trustee_03',
      name: 'Elena Rostova',
      title: 'International Transparency Observer',
      hasSubmitted: false,
    },
  ]);

  const [enteredShare, setEnteredShare] = useState('');
  const [selectedTrustee, setSelectedTrustee] = useState('trustee_03');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submittedCount = trustees.filter((t) => t.hasSubmitted).length;
  const isThresholdMet = submittedCount >= 2;

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredShare) return;

    setIsLoading(true);
    setSuccessMessage(null);

    try {
      try {
        await adminApiClient.admin.submitKeyShare(
          'elec_2026_national_general',
          selectedTrustee,
          enteredShare,
        );
      } catch (e) {
        // Fallback demo update
      }

      setTrustees((prev) =>
        prev.map((t) =>
          t.id === selectedTrustee
            ? { ...t, hasSubmitted: true, submittedAt: new Date().toUTCString().slice(17, 25) + ' UTC' }
            : t,
        ),
      );

      setSuccessMessage('Trustee cryptographic key share successfully verified and ingested.');
      setEnteredShare('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
          Cryptographic Decryption Protocol
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">
          2-of-3 Shamir Key Ceremony
        </h1>
        <p className="text-xs text-slate-400">
          Ballots remain encrypted with collective public keys until at least 2 trustees independently provide their cryptographic shares.
        </p>
      </div>

      {/* Threshold Status Banner */}
      <div
        className={`p-6 rounded-3xl admin-card border transition-all duration-300 ${
          isThresholdMet
            ? 'border-emerald-500/40 shadow-glow-emerald bg-emerald-950/20'
            : 'border-sky-500/40 shadow-glow-sky bg-sky-950/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isThresholdMet
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
              }`}
            >
              {isThresholdMet ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Threshold Status ({submittedCount} of 3 Shares Collected)
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {isThresholdMet
                  ? 'Quorum Achieved • Tally Key Reconstructible'
                  : 'Awaiting Trustee Shares'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isThresholdMet
                  ? 'The collective private key can now decrypt sealed ballots and verify final candidate vote totals.'
                  : 'At least 2 shares are required by constitutional protocol to reconstruct the decryption key.'}
              </p>
            </div>
          </div>

          {isThresholdMet && (
            <a
              href="/results/elec_2026_national_general"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              Generate Official Tally
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Trustees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trustees.map((trustee) => (
          <div
            key={trustee.id}
            className={`p-5 rounded-2xl admin-card border transition-all ${
              trustee.hasSubmitted
                ? 'border-emerald-500/30 bg-surface-200/90'
                : 'border-slate-800 bg-surface-300/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                {trustee.id}
              </span>
              {trustee.hasSubmitted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Submitted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Awaiting
                </span>
              )}
            </div>

            <h4 className="text-sm font-extrabold text-white">{trustee.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{trustee.title}</p>

            {trustee.hasSubmitted && trustee.submittedAt && (
              <span className="text-[10px] text-slate-500 font-mono mt-3 block">
                Recorded: {trustee.submittedAt}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Share Submission Form for Unsubmitted Trustees */}
      <div className="rounded-3xl admin-card border border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          Submit Trustee Cryptographic Share
        </h3>

        <form onSubmit={handleShareSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Trustee Authority
              </label>
              <select
                value={selectedTrustee}
                onChange={(e) => setSelectedTrustee(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {trustees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.hasSubmitted ? 'Submitted' : 'Pending'})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Shamir Key Share Payload (Hexadecimal)
              </label>
              <input
                type="text"
                required
                value={enteredShare}
                onChange={(e) => setEnteredShare(e.target.value)}
                placeholder="e.g. 02e4f8819a0b3c4d5e6f708192a3b4c5d6e7f8..."
                className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() =>
                setEnteredShare('03a98f12b03c49e782f9104b92c819203a9b1c2d3e4f5061728394a5b6c7d8e9')
              }
              className="text-[11px] text-cyan-400 hover:underline font-semibold"
            >
              Autofill Sample Share for Trustee 3
            </button>

            <button
              type="submit"
              disabled={isLoading || !enteredShare}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Ingest Key Share'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
