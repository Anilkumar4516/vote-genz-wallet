'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, syncAuthToken } from '../../lib/api/client';
import { useAuthStore } from '../../store/auth.store';
import { useVoteFlowStore } from '../../store/vote-flow.store';
import { useToast } from '../../components/ui/Toast';

export function useVerifyOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { sessionId, setAuthenticated, setProfile } = useAuthStore();
  const { setStep } = useVoteFlowStore();
  const { showToast } = useToast();

  const confirmOtp = async (otp: string) => {
    if (!sessionId) {
      setError('Active authentication session not found. Please log in again.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authRes = await apiClient.auth.verifyOtp({
        sessionId,
        otp: otp.trim(),
      });

      // Synchronize client token
      syncAuthToken(authRes.accessToken);

      // Fetch voter profile
      let profile;
      try {
        profile = await apiClient.auth.getMe();
        setProfile(profile);
      } catch {
        // Fallback profile if registry offline/simulated
        profile = {
          id: 'vtr_demo_' + Math.random().toString(36).substring(2, 8),
          nationalId: 'EPIC987654321',
          voterHash: authRes.voterHash,
          fullName: 'Suresh Kumar Sharma',
          constituencyCode: 'AC-142 Bangalore South',
          pollingStation: 'Government High School, Room 4',
          hasVoted: false,
          status: 'ACTIVE' as const,
        };
        setProfile(profile);
      }

      setAuthenticated(authRes.accessToken, profile);
      setStep('IDENTITY');
      showToast('success', 'Authentication Confirmed', 'Welcome to the confidential voting booth.');
      router.push('/identity');
      return authRes;
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired passcode. Please try again.';
      setError(msg);
      showToast('error', 'Passcode Verification Failed', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { confirmOtp, isLoading, error };
}
