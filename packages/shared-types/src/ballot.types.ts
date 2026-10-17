/**
 * Zero-Knowledge Ballot, Cast Request, and Merkle Proof Domain Types
 */

export interface EncryptedBallotPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  ephemeralPublicKey?: string;
}

export interface CastVoteRequest {
  electionId: string;
  blindVotingToken: string;
  encryptedBallot: EncryptedBallotPayload;
  zkProof?: string;
}

export interface BallotCastReceipt {
  receiptCode: string;
  merkleLeafHash: string;
  merkleRoot: string;
  leafIndex: number;
  timestampRounded: string;
  status: 'ACCEPTED' | 'RECORDED';
}

export interface MerkleAuditPathStep {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleInclusionProof {
  receiptCode: string;
  leafHash: string;
  leafIndex: number;
  rootHash: string;
  auditPath: MerkleAuditPathStep[];
  isVerified: boolean;
}

/**
 * Anonymized Zero-Knowledge Ballot stored in Ballot Box DB.
 * NOTE: Strict architectural constraint - NO citizen identification or voter_id column permitted.
 */
export interface AnonymizedBallotRecord {
  id: string;
  electionId: string;
  ciphertext: string;
  iv: string;
  authTag: string;
  receiptCode: string;
  merkleLeafHash: string;
  timestampRounded: string;
}
