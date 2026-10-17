'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api/client';
import { useAuthStore } from '../../store/auth.store';
import { useToast } from '../../components/ui/Toast';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setSession } = useAuthStore();
  const { showToast } = useToast();

  const initiateLogin = async (nationalId: string, phoneNumber?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.auth.login({
        nationalId: nationalId.trim().toUpperCase(),
        phoneNumber: phoneNumber?.trim(),
      });

      setSession(res.sessionId, nationalId.trim().toUpperCase(), res.phoneMasked);
      showToast('success', 'Passcode Sent', res.message || 'Check your registered mobile number for the OTP.');
      router.push('/verify-otp');
      return res;
    } catch (err: any) {
      const msg = err.message || 'Authentication request failed. Please verify your Voter ID.';
      setError(msg);
      showToast('error', 'Login Failed', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { initiateLogin, isLoading, error };
}
