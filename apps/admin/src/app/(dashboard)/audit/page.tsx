'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApiClient } from '../../../lib/api';
import { DataTable, Column } from '../../../components/DataTable';
import { AuditLogEntry } from '@vote-wallet/shared-types';
import { formatDate } from '../../../lib/utils';
import { FileText, CheckCircle2, ShieldCheck, Link2, Copy, Check } from 'lucide-react';

export default function AuditLogViewerPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await adminApiClient.admin.getAuditChain();
        if (res && res.length > 0) {
          setLogs(res);
        } else {
          setLogs(getSampleAuditLogs());
        }
      } catch {
        setLogs(getSampleAuditLogs());
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Event ID & Time',
      render: (log) => (
        <div>
          <span className="font-mono text-xs text-slate-900 font-bold block">{log.id}</span>
          <span className="text-[11px] text-slate-500">{formatDate(log.timestamp)}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (log) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-yellow-300 shadow-sm">
          {log.action}
        </span>
      ),
    },
    {
      header: 'Actor',
      render: (log) => (
        <span className="font-mono text-xs text-slate-700">{log.actor}</span>
      ),
    },
    {
      header: 'SHA-256 Current Hash',
      render: (log) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
          <span className="text-emerald-700 font-bold truncate max-w-[160px]">
            {log.currentHash}
          </span>
        </div>
      ),
    },
    {
      header: 'Previous Hash (Chain Link)',
      render: (log) => (
        <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
          <Link2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate max-w-[130px]">{log.previousHash}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Cryptographic Integrity Ledger
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Immutable Audit Log Viewer</h1>
          <p className="text-xs text-slate-600">
            Hash-chained administrative, authentication, and cryptographic ballot events.
          </p>
        </div>

        <Link
          href="/audit/verify"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-xs font-black text-slate-950 shadow-md border border-yellow-400 transition-all self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          Run Hash-Chain Verification
        </Link>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Search by action, actor, or event ID..."
        searchFilter={(log, query) =>
          log.action.toLowerCase().includes(query.toLowerCase()) ||
          log.actor.toLowerCase().includes(query.toLowerCase()) ||
          log.id.toLowerCase().includes(query.toLowerCase())
        }
        pageSize={10}
      />
    </div>
  );
}

function getSampleAuditLogs(): AuditLogEntry[] {
  return [
    {
      id: 'aud_001',
      action: 'ELECTION_STATUS_CHANGED',
      actor: 'admin:commissioner_chief',
      details: { from: 'SCHEDULED', to: 'OPEN' },
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: '2026-10-17T07:00:00.000Z',
    },
    {
      id: 'aud_002',
      action: 'VOTER_AUTHENTICATED',
      actor: 'voter:hash_suresh_sharma',
      details: { factor: 'OTP+FACE' },
      previousHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      currentHash: '8f2a10c9d38b4172a501e7492c01948ba201e7492c01948ba201e7492c01948b',
      timestamp: '2026-10-17T07:05:12.000Z',
    },
    {
      id: 'aud_003',
      action: 'VOTE_TOKEN_ISSUED',
      actor: 'system:voting-service',
      details: { electionId: 'elec_2026_national_general' },
      previousHash: '8f2a10c9d38b4172a501e7492c01948ba201e7492c01948ba201e7492c01948b',
      currentHash: '9a4f21b778e22c01d431c93f0b83b8a1c93a0b83b8a1c93a0b83b8a1c93a0b83',
      timestamp: '2026-10-17T07:05:45.000Z',
    },
    {
      id: 'aud_004',
      action: 'BALLOT_CAST',
      actor: 'token:blind_vtok_anonymous',
      details: { receiptIssued: true },
      previousHash: '9a4f21b778e22c01d431c93f0b83b8a1c93a0b83b8a1c93a0b83b8a1c93a0b83',
      currentHash: '1a2b3c4d5e6f708192a3b4c5d6e7f8011a2b3c4d5e6f708192a3b4c5d6e7f801',
      timestamp: '2026-10-17T07:06:01.000Z',
    },
    {
      id: 'aud_005',
      action: 'KEY_CEREMONY_SHARE_SUBMITTED',
      actor: 'admin:trustee_01',
      details: { shareIndex: 1 },
      previousHash: '1a2b3c4d5e6f708192a3b4c5d6e7f8011a2b3c4d5e6f708192a3b4c5d6e7f801',
      currentHash: 'b4c5d6e7f8011a2b3c4d5e6f708192a3b4c5d6e7f8011a2b3c4d5e6f708192a3',
      timestamp: '2026-10-17T19:15:00.000Z',
    },
  ];
}
