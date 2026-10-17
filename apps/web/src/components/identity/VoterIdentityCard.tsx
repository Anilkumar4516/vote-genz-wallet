'use client';

import React from 'react';
import { VoterProfile } from '@vote-wallet/shared-types';
import { ShieldCheck, MapPin, Building, User, CheckCircle2, AlertOctagon } from 'lucide-react';
import { maskNationalId } from '../../lib/utils';

interface VoterIdentityCardProps {
  profile: VoterProfile;
}

export const VoterIdentityCard: React.FC<VoterIdentityCardProps> = ({ profile }) => {
  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl glass-card border border-cyan-500/30 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative national seal background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
            Official Voter Identification
          </span>
          <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
            {profile.fullName}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          Verified
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Photo Frame */}
        <div className="relative shrink-0">
          <div className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-slate-700 bg-surface-300 flex items-center justify-center shadow-lg">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-slate-500" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Voter Metadata Fields */}
        <div className="flex-1 w-full space-y-3">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              National Voter ID (EPIC)
            </span>
            <p className="font-mono text-sm font-bold text-cyan-300">
              {maskNationalId(profile.nationalId)}
            </p>
          </div>

          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Constituency</span>
              <span className="font-semibold text-white">{profile.constituencyCode}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs">
            <Building className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Assigned Polling Station</span>
              <span className="font-semibold text-white">{profile.pollingStation}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Ballot Participation Status
            </span>
            {profile.hasVoted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <AlertOctagon className="w-3.5 h-3.5" />
                Vote Already Recorded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Eligible to Cast Ballot
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
