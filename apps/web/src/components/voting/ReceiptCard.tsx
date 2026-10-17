'use client';

import React, { useState } from 'react';
import { BallotCastReceipt } from '@vote-wallet/shared-types';
import { CheckCircle2, Download, Copy, Check, ShieldCheck, QrCode } from 'lucide-react';
import { formatReceiptCode } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ReceiptCardProps {
  receipt: BallotCastReceipt;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receiptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `==========================================================
VOTE WALLET - OFFICIAL ELECTORAL BALLOT RECEIPT
==========================================================
Receipt Code:     ${receipt.receiptCode}
Status:           ${receipt.status}
Merkle Root:      ${receipt.merkleRoot}
Leaf Hash:        ${receipt.merkleLeafHash}
Merkle Index:     #${receipt.leafIndex}
Timestamp:        ${receipt.timestampRounded}
==========================================================
Verify online at: https://vote.gov/check-receipt?code=${receipt.receiptCode}
Cryptographically sealed with AES-256-GCM & SHA-256 Merkle Tree
==========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VoteReceipt_${receipt.receiptCode.slice(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl glass-card border border-emerald-500/40 shadow-glow-emerald p-6 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
          Cryptographically Recorded & Verified
        </span>
        <h3 className="text-2xl font-black text-white">Official Ballot Receipt</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Your sealed ballot is securely stored in the national ballot box and anchored in the Merkle audit tree.
        </p>
      </div>

      {/* Main Receipt Code Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-100 border border-slate-700 space-y-2 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Voter Receipt Code
        </span>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xl sm:text-2xl font-black text-cyan-300 tracking-wider">
            {formatReceiptCode(receipt.receiptCode)}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-200 text-slate-300 transition-colors"
            title="Copy Receipt Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Save this private code to independently verify your vote in the post-election public tally.
        </p>
      </div>

      {/* Cryptographic Details Table */}
      <div className="rounded-xl bg-surface-300/80 p-4 border border-slate-800 text-xs space-y-2.5 font-mono">
        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-400 text-[11px]">Merkle Root:</span>
          <span className="text-slate-200 truncate max-w-[220px] text-right font-semibold">
            {receipt.merkleRoot}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-400 text-[11px]">Leaf Hash:</span>
          <span className="text-slate-200 truncate max-w-[220px] text-right font-semibold">
            {receipt.merkleLeafHash}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Merkle Index:</span>
          <span className="text-emerald-400 font-bold">#{receipt.leafIndex}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Timestamp:</span>
          <span className="text-slate-300 text-[11px]">{receipt.timestampRounded}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleDownload}
          variant="secondary"
          size="md"
          className="flex-1"
          leftIcon={<Download className="w-4 h-4" />}
        >
          Download Receipt
        </Button>
        <Button
          onClick={() => window.print()}
          variant="outline"
          size="md"
          className="flex-1"
          leftIcon={<QrCode className="w-4 h-4" />}
        >
          Print / Save PDF
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
        <ShieldCheck className="w-4 h-4" />
        Zero-Knowledge Guarantee: Ballot contains NO citizen ID
      </div>
    </div>
  );
};
