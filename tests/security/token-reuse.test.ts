import { test, expect } from '@playwright/test';

test.describe('Security Audit: Anonymous Vote Token Reuse Rejection', () => {
  test('A vote token cannot be reused in a subsequent request after being spent', async ({ request }) => {
    const singleUseToken = `vtoken_burn_test_${Date.now()}`;
    const payload = {
      electionId: '1',
      candidateId: 1,
      anonymousToken: singleUseToken,
      voteToken: singleUseToken,
      trackerHash: `0xburn_${Date.now()}`,
      encryptedVote: 'cipher_burn_payload',
    };

    // First cast: Expect success
    const firstCast = await request.post('/api/vote/cast', { data: payload });
    expect([200, 201, 202]).toContain(firstCast.status());

    // Second cast with identical token: MUST BE REJECTED
    const secondCast = await request.post('/api/vote/cast', { data: payload });
    expect([400, 403, 409, 422]).toContain(secondCast.status());

    const body = await secondCast.json().catch(() => ({}));
    if (body.error) {
      expect(body.error.toLowerCase()).toMatch(/already|used|spent|invalid|token/);
    }
  });
});
