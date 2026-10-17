'use client';

import React from 'react';
import { Eye, ArrowLeftRight, Smile, ShieldCheck } from 'lucide-react';

interface LivenessChallengeProps {
  requiredAction: 'BLINK' | 'HEAD_TURN' | 'SMILE';
  countdownSec: number;
  totalSec?: number;
}

export const LivenessChallenge: React.FC<LivenessChallengeProps> = ({
  requiredAction,
  countdownSec,
  totalSec = 10,
}) => {
  const actionConfigs = {
    BLINK: {
      title: 'Blink Your Eyes Now',
      description: 'Slowly blink both eyes twice inside the viewfinder.',
      icon: Eye,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-500/10',
    },
    HEAD_TURN: {
      title: 'Turn Head Slightly to the Left',
      description: 'Gently turn your head ~15 degrees to verify 3D depth.',
      icon: ArrowLeftRight,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      bgColor: 'bg-indigo-500/10',
    },
    SMILE: {
      title: 'Hold Still and Smile',
      description: 'Keep face centered and smile naturally.',
      icon: Smile,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-500/10',
    },
  };

  const current = actionConfigs[requiredAction] || actionConfigs.BLINK;
  const Icon = current.icon;
  const progressPercent = Math.max(0, (countdownSec / totalSec) * 100);

  return (
    <div className="w-full max-w-md mx-auto my-4 p-4 rounded-2xl glass-panel border border-slate-700/80 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Interactive Liveness Challenge
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
          <span>00:0{countdownSec}s</span>
        </div>
      </div>

      <div className={`flex items-center gap-4 p-3.5 rounded-xl border ${current.borderColor} ${current.bgColor}`}>
        <div className={`p-3 rounded-xl bg-surface-200 border border-slate-700 ${current.color} shadow-sm shrink-0`}>
          <Icon className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white">{current.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{current.description}</p>
        </div>
      </div>

      {/* Progress countdown bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
