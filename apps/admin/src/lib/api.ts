'use client';

import { VoteWalletClient, createVoteWalletClient } from '@vote-wallet/api-client';
import { getStoredAdminToken } from './auth';

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:3002';
const votingUrl = process.env.NEXT_PUBLIC_VOTING_SERVICE_URL || 'http://localhost:3000';
const authUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';

export const adminApiClient: VoteWalletClient = createVoteWalletClient({
  services: {
    admin: adminUrl,
    voting: votingUrl,
    auth: authUrl,
  },
  authToken: typeof window !== 'undefined' ? (getStoredAdminToken() || undefined) : undefined,
});

export function syncAdminToken(token: string | undefined): void {
  adminApiClient.setAuthToken(token);
}
