import { BaseApiClient, RequestOptions } from '../base-client';
import {
  Candidate,
  CastVoteRequest,
  BallotCastReceipt,
  MerkleInclusionProof,
  ElectionTally,
} from '@vote-wallet/shared-types';

export class VotingApiClient extends BaseApiClient {
  /**
   * Fetch approved candidate slates for an election/constituency
   */
  async getCandidates(electionId?: string, options?: RequestOptions): Promise<Candidate[]> {
    return this.get<Candidate[]>('/vote/candidates', {
      ...options,
      params: { electionId, ...options?.params },
    });
  }

  /**
   * Issue a blind, cryptographically unlinked voting token.
   * Requires VerifiedVoter guard (OTP + Face + Fingerprint passed).
   */
  async requestVotingToken(
    electionId: string,
    voterHash?: string,
    options?: RequestOptions,
  ): Promise<{ votingToken: string; expiresAt: string }> {
    return this.post<{ votingToken: string; expiresAt: string }>(
      '/vote/token',
      { electionId, voterHash },
      options,
    );
  }

  /**
   * Cast an encrypted zero-knowledge ballot into the isolated Ballot Box database.
   * Consumes blind voting token atomically and generates Merkle receipt.
   */
  async castBallot(payload: CastVoteRequest, options?: RequestOptions): Promise<BallotCastReceipt> {
    return this.post<BallotCastReceipt>('/vote/cast', payload, options);
  }

  /**
   * Lookup and verify ballot inclusion status using voter's private receipt code
   */
  async getReceipt(receiptCode: string, options?: RequestOptions): Promise<BallotCastReceipt> {
    return this.get<BallotCastReceipt>(`/vote/receipt/${encodeURIComponent(receiptCode)}`, options);
  }

  /**
   * Retrieve cryptographic Merkle tree inclusion proof for receipt verification
   */
  async getMerkleProof(
    receiptCode: string,
    options?: RequestOptions,
  ): Promise<MerkleInclusionProof> {
    return this.get<MerkleInclusionProof>(
      `/vote/merkle-proof/${encodeURIComponent(receiptCode)}`,
      options,
    );
  }

  /**
   * Retrieve official finalized tally summary and cryptographic balance confirmation
   */
  async getTally(electionId: string, options?: RequestOptions): Promise<ElectionTally> {
    return this.get<ElectionTally>(`/vote/tally/${encodeURIComponent(electionId)}`, options);
  }
}
