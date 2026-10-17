'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PageShell } from '../../components/layout/PageShell';
import { ProgressSteps } from '../../components/verification/ProgressSteps';
import { VotingStep } from '../../types';

export default function VoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Map pathname to active VotingStep for the progress bar
  const resolveCurrentStep = (): VotingStep => {
    if (pathname.includes('/identity')) return 'IDENTITY';
    if (pathname.includes('/verify/face')) return 'VERIFY_FACE';
    if (pathname.includes('/verify/fingerprint')) return 'VERIFY_FINGERPRINT';
    if (pathname.includes('/ballot')) return 'BALLOT';
    if (pathname.includes('/review')) return 'REVIEW';
    if (pathname.includes('/receipt')) return 'RECEIPT';
    return 'IDENTITY';
  };

  const currentStep = resolveCurrentStep();

  return (
    <PageShell glow className="py-6 sm:py-10">
      <ProgressSteps currentStep={currentStep} />
      <div className="w-full">{children}</div>
    </PageShell>
  );
}
