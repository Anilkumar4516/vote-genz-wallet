import { BallotService } from './ballot.service';
import { BallotCastTransaction } from './ballot-cast.transaction';

describe('BallotService', () => {
  let service: BallotService;
  let mockTransaction: any;

  beforeEach(() => {
    mockTransaction = {
      execute: jest.fn().mockResolvedValue({
        receiptCode: 'REC-TEST01',
        receiptHash: 'test-receipt-hash',
        merkleLeafHash: 'test-leaf-hash',
        roundedTimestamp: new Date().toISOString(),
        sealedAt: new Date().toISOString(),
      }),
    };
    service = new BallotService(mockTransaction);
  });

  it('should delegate vote casting to the isolated transaction', async () => {
    const res = await service.castVote({
      votingToken: 'sample-token',
      electionId: 'elec-2026',
      candidateId: 'cand-1',
    });

    expect(res.receiptCode).toBe('REC-TEST01');
    expect(mockTransaction.execute).toHaveBeenCalledTimes(1);
  });
});
