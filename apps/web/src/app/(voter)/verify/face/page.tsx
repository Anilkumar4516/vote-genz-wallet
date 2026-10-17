'use client';

import React, { useEffect, useState } from 'react';
import { FaceCapture } from '../../../../components/verification/FaceCapture';
import { LivenessChallenge } from '../../../../components/verification/LivenessChallenge';
import { useFaceVerify } from '../../../../features/verification/useFaceVerify';
import { useI18n } from '../../../../lib/i18n/config';
import { Eye, ShieldCheck } from 'lucide-react';

export default function FaceVerificationPage() {
  const {
    fetchChallenge,
    submitFaceVerification,
    isLoading,
    error,
    requiredAction,
  } = useFaceVerify();
  const [countdown, setCountdown] = useState(10);
  const { t } = useI18n();

  useEffect(() => {
    fetchChallenge();

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 10));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCapture = async (base64Image: string) => {
    await submitFaceVerification(base64Image);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Step 3 of 5 • Biometric Liveness Factor
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{t('face.header')}</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {t('face.desc')}
        </p>
      </div>

      {/* Dynamic Liveness Instruction */}
      <LivenessChallenge
        requiredAction={requiredAction}
        countdownSec={countdown}
        totalSec={10}
      />

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Camera Viewport & Capture */}
      <FaceCapture
        onCapture={handleCapture}
        isProcessing={isLoading}
      />

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        ArcFace Cosine Match Threshold 0.68 • Zero Raw Video Stored
      </div>
    </div>
  );
}
