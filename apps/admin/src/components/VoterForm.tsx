'use client';

import React, { useState } from 'react';
import { PhotoUploader } from './PhotoUploader';
import { VoterProfile } from '@vote-wallet/shared-types';
import { UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

interface VoterFormProps {
  onSubmit: (voterData: Partial<VoterProfile> & { photoBase64?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const VoterForm: React.FC<VoterFormProps> = ({ onSubmit, isLoading = false }) => {
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [constituencyCode, setConstituencyCode] = useState('AC-142 Bangalore South');
  const [pollingStation, setPollingStation] = useState('Government High School, Room 4');
  const [photoBase64, setPhotoBase64] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      fullName: fullName.trim(),
      nationalId: nationalId.trim().toUpperCase(),
      phoneMasked: phoneNumber.trim(),
      constituencyCode: constituencyCode.trim(),
      pollingStation: pollingStation.trim(),
      status: 'ACTIVE',
      hasVoted: false,
      photoBase64,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full Citizen Legal Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ramesh Chandra Sen"
            className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            National Voter ID (EPIC) *
          </label>
          <input
            type="text"
            required
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.toUpperCase())}
            placeholder="e.g. EPIC987654321"
            className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Registered Mobile Number *
          </label>
          <input
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Constituency Code *
          </label>
          <input
            type="text"
            required
            value={constituencyCode}
            onChange={(e) => setConstituencyCode(e.target.value)}
            placeholder="e.g. AC-142 Bangalore South"
            className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Assigned Polling Station *
        </label>
        <input
          type="text"
          required
          value={pollingStation}
          onChange={(e) => setPollingStation(e.target.value)}
          placeholder="e.g. Government High School, Room 4"
          className="w-full px-4 py-2.5 bg-surface-200 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Photo Uploader */}
      <PhotoUploader onPhotoSelected={(b64) => setPhotoBase64(b64)} />

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Voter hash and enrollment token generated upon submission</span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>{isLoading ? 'Enrolling Voter...' : 'Enroll Voter to Registry'}</span>
        </button>
      </div>
    </form>
  );
};
