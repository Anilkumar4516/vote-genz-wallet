import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let mockRegistryDataSource: any;

  beforeEach(() => {
    mockRegistryDataSource = {
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    };
    service = new TokenService(mockRegistryDataSource);
  });

  it('should issue a random rawToken and store only its SHA-256 hash', async () => {
    const res = await service.issueVotingToken('voter-hash-123', 'elec-2026');
    expect(res.rawToken).toBeDefined();
    expect(res.rawToken.length).toBe(64); // 32 bytes hex
    expect(res.expiresAt).toBeDefined();

    // Burning with the rawToken should succeed the first time
    const burnRes = await service.validateAndBurnToken(res.rawToken, 'elec-2026');
    expect(burnRes.voterHash).toBe('voter-hash-123');

    // Attempting to burn the same token a second time must fail
    await expect(service.validateAndBurnToken(res.rawToken, 'elec-2026')).rejects.toThrow(
      'Voting token has already been burned',
    );
  });
});
