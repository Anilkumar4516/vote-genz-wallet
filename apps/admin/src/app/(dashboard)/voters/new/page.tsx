'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VoterForm } from '../../../../components/VoterForm';
import { adminApiClient } from '../../../../lib/api';
import { VoterProfile } from '@vote-wallet/shared-types';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function NewVoterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (voterData: Partial<VoterProfile> & { photoBase64?: string }) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Create voter record
      const voter = await adminApiClient.admin.createVoter(voterData);

      // 2. Upload photo if selected
      if (voterData.photoBase64 && voter?.id) {
        try {
          await adminApiClient.admin.uploadPhoto(voter.id, voterData.photoBase64);
        } catch (e) {
          // Non-blocking warning if photo storage is mock
        }
      }

      setSuccessMessage(`Citizen ${voterData.fullName} successfully registered into electoral roll.`);
      setTimeout(() => router.push('/voters'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to enroll voter. Please ensure Voter ID is unique.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/voters"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Voter Registry
      </Link>

      <div className="pb-4 border-b border-slate-800">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
          Citizen Enrollment
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">Register New Elector</h1>
        <p className="text-xs text-slate-400">
          Enrolls a verified citizen with photo biometric reference into the electoral registry.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="rounded-3xl admin-card border border-slate-800 p-6 sm:p-8">
        <VoterForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
