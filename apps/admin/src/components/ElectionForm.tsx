'use client';

import React, { useState } from 'react';
import { CreateElectionDto, ElectionType } from '@vote-wallet/shared-types';
import { Vote, Calendar, ArrowRight } from 'lucide-react';

interface ElectionFormProps {
  onSubmit: (electionData: CreateElectionDto) => Promise<void>;
  isLoading?: boolean;
}

export const ElectionForm: React.FC<ElectionFormProps> = ({ onSubmit, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ElectionType>('PARLIAMENTARY');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
  );
  const [constituencies, setConstituencies] = useState('AC-142, AC-143, AC-144');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const constituencyCodes = constituencies
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      constituencyCodes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Official Election Title *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 2026 National Parliamentary General Election"
          className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Scope & Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Official mandate and constituency jurisdiction details..."
          className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Election Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ElectionType)}
            className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="PARLIAMENTARY">Parliamentary</option>
            <option value="PRESIDENTIAL">Presidential</option>
            <option value="LOCAL">Local Council</option>
            <option value="REFERENDUM">National Referendum</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Polls Open (Start Time) *
          </label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 bg-surface-200 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Polls Close (End Time) *
          </label>
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 bg-surface-200 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Constituency Codes (Comma-separated) *
        </label>
        <input
          type="text"
          required
          value={constituencies}
          onChange={(e) => setConstituencies(e.target.value)}
          placeholder="AC-142, AC-143, AC-144"
          className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Vote className="w-4 h-4" />
          <span>{isLoading ? 'Creating Election...' : 'Schedule & Create Election'}</span>
        </button>
      </div>
    </form>
  );
};
