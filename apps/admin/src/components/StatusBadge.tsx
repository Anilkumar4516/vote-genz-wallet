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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold shadow-sm';
      case 'SCHEDULED':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold shadow-sm';
      case 'CLOSED':
        return 'bg-amber-100 text-amber-900 border-yellow-400 font-extrabold shadow-sm';
      case 'SEALED':
      case 'TALLIED':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-sm';
      case 'SUSPENDED':
      case 'DECEASED':
      case 'CORRUPTED':
      case 'FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-sm';
      default:
        return 'bg-amber-50 text-slate-700 border-yellow-200 font-extrabold shadow-sm';
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
