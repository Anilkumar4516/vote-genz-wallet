'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReceipt } from '../../../features/voting/useReceipt';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { formatReceiptCode } from '../../../lib/utils';
import { Search, CheckCircle2, ShieldCheck, GitBranch, ArrowRight, Hash } from 'lucide-react';

export default function CheckReceiptPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams?.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const { verifyReceipt, receipt, proof, isLoading, error } = useReceipt();

  useEffect(() => {
    if (initialCode) {
      verifyReceipt(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      verifyReceipt(code);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Public Ledger Audit Tool
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Verify Ballot Inclusion</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Enter your confidential voter receipt code to mathematically verify that your sealed ballot has been recorded into the national ballot box and anchored in the public Merkle tree.
        </p>
      </div>

      {/* Code Search Box */}
      <Card variant="glass" glow="cyan" className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Enter Receipt Code (e.g. VOTE-98B2-4F11-C82D)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            leftIcon={<Hash className="w-4 h-4" />}
            className="font-mono text-sm tracking-wider uppercase"
          />
          <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            size="md"
            className="shrink-0"
            rightIcon={<Search className="w-4 h-4" />}
          >
            Verify Ballot
          </Button>
        </form>

        {/* Demo Fast-Check Code */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Don&apos;t have a code?</span>
          <button
            type="button"
            onClick={() => {
              setCode('VOTE-98B2-4F11-C82D');
              verifyReceipt('VOTE-98B2-4F11-C82D');
            }}
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            Load Sample Audited Receipt
          </button>
        </div>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400">Traversing cryptographic Merkle tree...</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Verification Result Card */}
      {receipt && (
        <Card variant="glass" glow="emerald" className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Verification Status
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Ballot Mathematically Verified
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              INCLUDED IN MERKLE TREE
            </div>
          </div>

          {/* Details Table */}
          <div className="rounded-xl bg-surface-300/80 p-4 border border-slate-800 text-xs space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400 text-[11px]">Receipt Code:</span>
              <span className="text-cyan-300 font-bold">{formatReceiptCode(receipt.receiptCode)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400 text-[11px]">Ballot Leaf Hash:</span>
              <span className="text-slate-200 truncate max-w-sm">{receipt.merkleLeafHash}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400 text-[11px]">Merkle Root Hash:</span>
              <span className="text-emerald-400 truncate max-w-sm font-semibold">{receipt.merkleRoot}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Tree Leaf Position:</span>
              <span className="text-white font-bold">Index #{receipt.leafIndex}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Timestamp (Hourly Rounding):</span>
              <span className="text-slate-300 text-[11px]">{receipt.timestampRounded}</span>
            </div>
          </div>

          {/* Merkle Audit Path Visualization */}
          {proof && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Cryptographic Inclusion Path Proof
                </h4>
              </div>
              <div className="space-y-2">
                {proof.auditPath.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 border border-slate-800 text-[11px] font-mono"
                  >
                    <span className="text-slate-400">
                      Step {idx + 1} ({step.position.toUpperCase()} sibling):
                    </span>
                    <span className="text-cyan-400 truncate max-w-xs">{step.hash}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Zero-Knowledge Verifiable: Proof confirms inclusion without exposing your vote.
          </div>
        </Card>
      )}
    </div>
  );
}
