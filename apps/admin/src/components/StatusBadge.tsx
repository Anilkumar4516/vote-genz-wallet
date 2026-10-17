import React from 'react';
import { cn } from '../lib/utils';
import { ElectionStatus, VoterStatus } from '@vote-wallet/shared-types';

interface StatusBadgeProps {
  status: ElectionStatus | VoterStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = String(status).toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'OPEN':
      case 'ACTIVE':
      case 'SUCCESS':
      case 'VALID':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'SCHEDULED':
      case 'PENDING':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'CLOSED':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'SEALED':
      case 'TALLIED':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'SUSPENDED':
      case 'DECEASED':
      case 'CORRUPTED':
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-700';
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border',
        getStyle(),
        sizeClasses[size],
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {normalized}
    </span>
  );
};
