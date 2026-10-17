'use client';

import React from 'react';
import { FingerprintPrompt } from '../../../../components/verification/FingerprintPrompt';
import { useWebAuthn } from '../../../../features/verification/useWebAuthn';
import { useI18n } from '../../../../lib/i18n/config';
import { ShieldCheck } from 'lucide-react';

export default function FingerprintVerificationPage() {
  const { verifyFingerprint, isScanning, isVerified, error } = useWebAuthn();
  const { t } = useI18n();

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Step 3 of 5 • Hardware Biometric Factor
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{t('fingerprint.header')}</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {t('fingerprint.desc')}
        </p>
      </div>

      <FingerprintPrompt
        onScan={verifyFingerprint}
        isScanning={isScanning}
        isVerified={isVerified}
        error={error}
      />

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        FIDO2 / WebAuthn Hardware Security Assertion
      </div>
    </div>
  );
}
