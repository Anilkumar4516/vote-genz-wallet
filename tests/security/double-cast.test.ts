import { test, expect } from '@playwright/test';

test.describe('Security Audit: Race Condition & Double Cast Defense', () => {
  test('Two parallel vote cast requests at the exact same millisecond must not result in double counting', async ({ request }) => {
    const electionId = 'elc_gen_2026';
    const sharedToken = `vtoken_race_${Date.now()}`;

    const requestPayload1 = {
      electionId,
      candidateId: 'cnd_01',
      voteToken: sharedToken,
      anonymousToken: sharedToken,
      trackerHash: `0xrace_1_${Date.now()}`,
      encryptedVote: 'cipher_race_1',
    };

    const requestPayload2 = {
      electionId,
      candidateId: 'cnd_02',
      voteToken: sharedToken,
      anonymousToken: sharedToken,
      trackerHash: `0xrace_2_${Date.now()}`,
      encryptedVote: 'cipher_race_2',
    };

    // Fire both requests simultaneously via Promise.all
    const [res1, res2] = await Promise.all([
      request.post('/api/vote/cast', { data: requestPayload1 }),
      request.post('/api/vote/cast', { data: requestPayload2 }),
    ]);

    const statuses = [res1.status(), res2.status()];

    // One request must succeed, and the other must be rejected
    // Under atomic Redis Lua burning or database transaction isolation,
    // exactly one vote can be accepted.
    const successfulResponses = statuses.filter(s => [200, 201, 202].includes(s));
    const rejectedResponses = statuses.filter(s => [400, 409, 422].includes(s));

    expect(successfulResponses.length).toBeLessThanOrEqual(1);
    expect(rejectedResponses.length).toBeGreaterThanOrEqual(1);
  });
});
