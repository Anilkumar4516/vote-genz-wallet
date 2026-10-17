'use client';

import React, { Suspense } from 'react';
import CheckReceiptContent from '../(voter)/check-receipt/page';
import { PageShell } from '../../components/layout/PageShell';
import { Spinner } from '../../components/ui/Spinner';

export default function CheckReceiptRootPage() {
  return (
    <PageShell glow className="py-8 sm:py-16">
      <Suspense
        fallback={
          <div className="flex justify-center p-12">
            <Spinner size="lg" />
          </div>
        }
      >
        <CheckReceiptContent />
      </Suspense>
    </PageShell>
  );
}
