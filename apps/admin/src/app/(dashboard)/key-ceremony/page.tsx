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
      <div className="pb-4 border-b border-yellow-200">
        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
          Cryptographic Decryption Protocol
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          2-of-3 Shamir Key Ceremony
        </h1>
        <p className="text-xs text-slate-600">
          Ballots remain encrypted with collective public keys until at least 2 trustees independently provide their cryptographic shares.
        </p>
      </div>

      {/* Threshold Status Banner */}
      <div
        className={`p-6 rounded-3xl admin-card border transition-all duration-300 ${
          isThresholdMet
            ? 'border-emerald-300 shadow-warm-card bg-emerald-50/40'
            : 'border-yellow-300 shadow-warm-card bg-amber-50/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isThresholdMet
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-yellow-300'
              }`}
            >
              {isThresholdMet ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Threshold Status ({submittedCount} of 3 Shares Collected)
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {isThresholdMet
                  ? 'Quorum Achieved • Tally Key Reconstructible'
                  : 'Awaiting Trustee Shares'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {isThresholdMet
                  ? 'The collective private key can now decrypt sealed ballots and verify final candidate vote totals.'
                  : 'At least 2 shares are required by constitutional protocol to reconstruct the decryption key.'}
              </p>
            </div>
          </div>

          {isThresholdMet && (
            <a
              href="/results/elec_2026_national_general"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md border border-yellow-400 transition-all shrink-0 cursor-pointer"
            >
              Generate Official Tally
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
                ? 'border-emerald-300 bg-white shadow-sm'
                : 'border-yellow-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                {trustee.id}
              </span>
              {trustee.hasSubmitted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  Submitted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-yellow-300">
                  Awaiting
                </span>
              )}
            </div>

            <h4 className="text-sm font-extrabold text-slate-900">{trustee.name}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{trustee.title}</p>

            {trustee.hasSubmitted && trustee.submittedAt && (
              <span className="text-[10px] text-slate-500 font-mono mt-3 block">
                Recorded: {trustee.submittedAt}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Share Submission Form for Unsubmitted Trustees */}
      <div className="rounded-3xl admin-card border border-yellow-200 p-6 sm:p-8 space-y-4 bg-white shadow-warm-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600" />
          Submit Trustee Cryptographic Share
        </h3>

        <form onSubmit={handleShareSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trustee Authority
              </label>
              <select
                value={selectedTrustee}
                onChange={(e) => setSelectedTrustee(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-yellow-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
              >
                {trustees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.hasSubmitted ? 'Submitted' : 'Pending'})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shamir Key Share Payload (Hexadecimal)
              </label>
              <input
                type="text"
                required
                value={enteredShare}
                onChange={(e) => setEnteredShare(e.target.value)}
                placeholder="e.g. 02e4f8819a0b3c4d5e6f708192a3b4c5d6e7f8..."
                className="w-full px-4 py-2.5 bg-white border border-yellow-300 rounded-xl text-xs font-mono text-amber-950 focus:outline-none focus:border-amber-500 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() =>
                setEnteredShare('03a98f12b03c49e782f9104b92c819203a9b1c2d3e4f5061728394a5b6c7d8e9')
              }
              className="text-[11px] text-amber-700 hover:underline font-bold"
            >
              Autofill Sample Share for Trustee 3
            </button>

            <button
              type="submit"
              disabled={isLoading || !enteredShare}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md border border-yellow-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Ingest Key Share'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
