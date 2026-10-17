'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ElectionForm } from '../../../../components/ElectionForm';
import { adminApiClient } from '../../../../lib/api';
import { CreateElectionDto } from '@vote-wallet/shared-types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function NewElectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (dto: CreateElectionDto) => {
    setIsLoading(true);
    setError(null);

    try {
      await adminApiClient.admin.createElection(dto);
      setSuccess(`Election "${dto.title}" successfully scheduled in the electoral registry.`);
      setTimeout(() => router.push('/elections'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create election. Please ensure valid date ranges.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/elections"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Elections Directory
      </Link>

      <div className="pb-4 border-b border-slate-800">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
          Electoral Mandate Configuration
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">Schedule New Election</h1>
        <p className="text-xs text-slate-400">
          Configure voting windows, participating constituency jurisdictions, and ballot parameters.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="rounded-3xl admin-card border border-slate-800 p-6 sm:p-8">
        <ElectionForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
