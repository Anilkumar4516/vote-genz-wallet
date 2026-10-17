'use client';

import { VoteWalletClient, createVoteWalletClient } from '@vote-wallet/api-client';
import { getStoredToken } from '../auth/session';

const authUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
const votingUrl = process.env.NEXT_PUBLIC_VOTING_SERVICE_URL || 'http://localhost:3000';
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:3002';
const faceUrl = process.env.NEXT_PUBLIC_FACE_SERVICE_URL || 'http://localhost:8000';

export const apiClient: VoteWalletClient = createVoteWalletClient({
  services: {
    auth: authUrl,
    voting: votingUrl,
    admin: adminUrl,
    face: faceUrl,
  },
  authToken: typeof window !== 'undefined' ? (getStoredToken() || undefined) : undefined,
});

/**
 * Update active authorization token across all client instances
 */
export function syncAuthToken(token: string | undefined): void {
  apiClient.setAuthToken(token);
}
