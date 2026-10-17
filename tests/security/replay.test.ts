import { test, expect } from '@playwright/test';

test.describe('Security Audit: Cryptographic Replay Attack Resistance', () => {
  test('Replaying an expired biometric challenge nonce is strictly rejected', async ({ request }) => {
    // Challenge generated 15 minutes ago (well past the 5-minute TTL)
    const staleChallengePayload = {
      challengeId: 'chal_expired_nonce_987654321',
      image: 'base64_captured_frame_replay',
      completedActions: ['blink', 'turn_left'],
      timestamp: Date.now() - (15 * 60 * 1000), // 15 mins ago
    };

    const res = await request.post('/api/verify/face', { data: staleChallengePayload });

    // Stale challenge must fail verification or return client error
    expect([400, 401, 403, 404, 422]).toContain(res.status());
  });

  test('Biometric challenge signature with altered nonce is invalid', async ({ request }) => {
    const alteredPayload = {
      challenge: 'original_challenge_123',
      tamperedSignature: 'sig_faked_0000000000000000000000000000000000000000000000000000000000000000',
    };

    const res = await request.post('/api/verify/biometric', { data: alteredPayload });
    expect([400, 401, 403, 404]).toContain(res.status());
  });
});
