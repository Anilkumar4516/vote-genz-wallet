'use client';

import React from 'react';
import { Fingerprint, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface FingerprintPromptProps {
  onScan: () => void;
  isScanning?: boolean;
  isVerified?: boolean;
  error?: string | null;
}

export const FingerprintPrompt: React.FC<FingerprintPromptProps> = ({
  onScan,
  isScanning = false,
  isVerified = false,
  error,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto rounded-3xl glass-card border border-cyan-500/30 shadow-glow-cyan">
      {/* Sensor Icon with Scanning Ripple */}
      <div className="relative my-6 flex items-center justify-center">
        {isScanning && (
          <>
            <div className="absolute w-36 h-36 rounded-full border-2 border-cyan-400/40 animate-ping pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 animate-pulse pointer-events-none" />
          </>
        )}

        <div
          onClick={!isScanning && !isVerified ? onScan : undefined}
          className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
            isVerified
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-glow-emerald scale-105'
              : isScanning
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan'
              : 'bg-surface-100 hover:bg-surface-50 border-slate-700 hover:border-cyan-400 text-slate-300'
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="w-14 h-14" />
          ) : (
            <Fingerprint className={`w-14 h-14 ${isScanning ? 'animate-pulse' : ''}`} />
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-1">
        {isVerified
          ? 'Hardware Biometric Verified'
          : isScanning
          ? 'Reading Biometric Sensor...'
          : 'Touch Fingerprint Sensor'}
      </h3>

      <p className="text-xs text-slate-400 max-w-xs mb-6">
        {isVerified
          ? 'Cryptographic FIDO2 / WebAuthn signature successfully verified by auth service.'
          : 'Place your registered finger on your device sensor or security key to complete factor 3 authentication.'}
      </p>

      {error && (
        <div className="mb-4 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800 px-3 py-2 rounded-xl">
          {error}
        </div>
      )}

      {!isVerified && (
        <Button
          onClick={onScan}
          isLoading={isScanning}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isScanning ? 'Awaiting Sensor Input...' : 'Activate Hardware Sensor'}
        </Button>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Protected by FIDO2 / WebAuthn Hardware Security
      </div>
    </div>
  );
};
