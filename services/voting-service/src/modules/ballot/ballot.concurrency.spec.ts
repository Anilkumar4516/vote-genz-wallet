import { BallotCastTransaction } from './ballot-cast.transaction';
import { ConflictException } from '@nestjs/common';

describe('Ballot Concurrency Spec: Double-Cast Prevention', () => {
  let transaction: BallotCastTransaction;
  let mockRegistryDataSource: any;
  let mockBallotBoxDataSource: any;
  let mockTokenService: any;
  let mockEncryptionService: any;

  beforeEach(() => {
    let tokenBurned = false;

    mockTokenService = {
      validateAndBurnToken: jest.fn().mockImplementation(async (token: string) => {
        if (tokenBurned) {
          throw new ConflictException('Voting token has already been burned.');
        }
        tokenBurned = true;
        return { voterHash: 'vh-concurrency-test-citizen' };
      }),
    };

    mockRegistryDataSource = {
      query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'part-1' }] }),
    };

    mockBallotBoxDataSource = {
      query: jest.fn().mockResolvedValue({ rowCount: 1 }),
    };

    mockEncryptionService = {
      encrypt: jest.fn().mockResolvedValue({
        ciphertext: 'mock-ciphertext',
        iv: 'mock-iv',
        authTag: 'mock-authtag',
        encryptedKey: 'mock-dek',
      }),
    };

    transaction = new BallotCastTransaction(
      mockRegistryDataSource,
      mockBallotBoxDataSource,
      mockTokenService,
      mockEncryptionService,
    );
  });

  it('rejects double-cast attempt when two identical requests hit the server concurrently', async () => {
    const castInput = {
      votingToken: 'single-use-secret-token',
      electionId: 'elec-2026',
      candidateId: 'cand-progress',
    };

    // Execute two concurrent requests at the exact same moment
    const results = await Promise.allSettled([
      transaction.execute(castInput),
      transaction.execute(castInput),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed, and the duplicate must be strictly rejected
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    const rejectedReason = (failures[0] as PromiseRejectedResult).reason;
    expect(rejectedReason).toBeInstanceOf(ConflictException);
    expect(rejectedReason.message).toContain('Voting token has already been burned');
  });
});
