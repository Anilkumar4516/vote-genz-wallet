'use client';

import React from 'react';
import Link from 'next/link';
import { useVoteFlowStore } from '../../../store/vote-flow.store';
import { useAuthStore } from '../../../store/auth.store';
import { ReceiptCard } from '../../../components/voting/ReceiptCard';
import { Button } from '../../../components/ui/Button';
import { useI18n } from '../../../lib/i18n/config';
import { CheckCircle2, Home, LogOut } from 'lucide-react';

export default function ReceiptPage() {
  const { receipt, resetFlow } = useVoteFlowStore();
  const { logout } = useAuthStore();
  const { t } = useI18n();

  // Fallback demo receipt if directly accessed
  const effectiveReceipt = receipt || {
    receiptCode: 'VOTE98B24F11C82D',
    merkleLeafHash: '0x8f2a10c9d38b4172a501e7492c01948ba201e7492c01948ba201e7492c01948b',
    merkleRoot: '0x9a4f21b778e22c01d431c93f0b83b8a1c93a0b83b8a1c93a0b83b8a1c93a0b83',
    leafIndex: 4092,
    timestampRounded: new Date().toISOString().slice(0, 13) + ':00:00.000Z',
    status: 'RECORDED' as const,
  };

  const handleExit = () => {
    resetFlow();
    logout();
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <ReceiptCard receipt={effectiveReceipt} />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link href="/" className="w-full sm:w-auto flex-1">
          <Button
            onClick={handleExit}
            variant="ghost"
            size="md"
            className="w-full"
            leftIcon={<Home className="w-4 h-4" />}
          >
            {t('nav.home')}
          </Button>
        </Link>

        <Link
          href={`/check-receipt?code=${effectiveReceipt.receiptCode}`}
          className="w-full sm:w-auto flex-1"
        >
          <Button
            variant="outline"
            size="md"
            className="w-full"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Verify on Public Ledger
          </Button>
        </Link>

        <Button
          onClick={handleExit}
          variant="secondary"
          size="md"
          className="w-full sm:w-auto flex-1"
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          {t('receipt.finish')}
        </Button>
      </div>
    </div>
  );
}
