'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { Shield, UserCheck, Eye, Vote, Receipt, Check } from 'lucide-react';
import { VotingStep } from '../../types';

interface ProgressStepsProps {
  currentStep: VotingStep;
}

interface StepItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  associatedSteps: VotingStep[];
}

const STEPS: StepItem[] = [
  {
    id: 'auth',
    label: '1. Auth',
    icon: Shield,
    associatedSteps: ['LOGIN', 'OTP'],
  },
  {
    id: 'identity',
    label: '2. Identity',
    icon: UserCheck,
    associatedSteps: ['IDENTITY', 'CONSENT'],
  },
  {
    id: 'verify',
    label: '3. Verify',
    icon: Eye,
    associatedSteps: ['VERIFY_FACE', 'VERIFY_FINGERPRINT'],
  },
  {
    id: 'ballot',
    label: '4. Ballot',
    icon: Vote,
    associatedSteps: ['BALLOT', 'REVIEW'],
  },
  {
    id: 'receipt',
    label: '5. Receipt',
    icon: Receipt,
    associatedSteps: ['RECEIPT'],
  },
];

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  // Helper to determine step status
  const getStepStatus = (stepIndex: number): 'completed' | 'active' | 'upcoming' => {
    const currentStepIndex = STEPS.findIndex((s) => s.associatedSteps.includes(currentStep));
    if (currentStepIndex === -1) return 'upcoming';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-2">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />

        {STEPS.map((step, idx) => {
          const status = getStepStatus(idx);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  status === 'completed' &&
                    'bg-emerald-500 border-emerald-400 text-white shadow-glow-emerald',
                  status === 'active' &&
                    'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan ring-4 ring-cyan-500/10 scale-105',
                  status === 'upcoming' &&
                    'bg-surface-200 border-slate-700 text-slate-500',
                )}
              >
                {status === 'completed' ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-[10px] sm:text-xs font-semibold tracking-wide transition-colors',
                  status === 'completed' && 'text-emerald-400',
                  status === 'active' && 'text-cyan-400 font-bold',
                  status === 'upcoming' && 'text-slate-500',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
