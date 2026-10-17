import { TallyService } from './tally.service';

describe('TallyService', () => {
  let service: TallyService;
  let mockBallotBox: any;
  let mockEncryption: any;
  let mockKeyRelease: any;
  let mockVerification: any;

  beforeEach(() => {
    mockBallotBox = {
      query: jest.fn().mockResolvedValue({
        rows: [
          { encryptedPayload: JSON.stringify({ candidateId: 'cand-1' }) },
          { encryptedPayload: JSON.stringify({ candidateId: 'cand-2' }) },
          { encryptedPayload: JSON.stringify({ candidateId: 'cand-1' }) },
        ],
      }),
    };

    mockEncryption = {
      decrypt: jest.fn().mockImplementation(async (envelope: any) => JSON.stringify(envelope)),
    };

    mockKeyRelease = {
      releaseTallyKey: jest.fn().mockResolvedValue('master-key-hex-test'),
    };

    mockVerification = {
      verifyIntegrity: jest.fn().mockResolvedValue({
        electionId: 'elec-2026',
        totalVotersParticipated: 3,
        totalBallotsFoundInBox: 3,
        isIntegrityVerified: true,
        verifiedAt: new Date().toISOString(),
      }),
    };

    service = new TallyService(
      mockBallotBox,
      mockEncryption,
      mockKeyRelease,
      mockVerification,
    );
  });

  it('verifies participation count and aggregates votes correctly', async () => {
    const res = await service.computeTally('elec-2026', 'SEALED');

    expect(mockVerification.verifyIntegrity).toHaveBeenCalledWith('elec-2026');
    expect(res.totalVotesCast).toBe(3);
    expect(res.results.length).toBeGreaterThan(0);

    const cand1 = res.results.find((c) => c.candidateId === 'cand-1');
    const cand2 = res.results.find((c) => c.candidateId === 'cand-2');

    expect(cand1?.voteCount).toBe(2);
    expect(cand2?.voteCount).toBe(1);
    expect(res.tallyProofSignature).toBeDefined();
  });
});
