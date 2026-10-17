/**
 * Ballot Entity: Persisted strictly inside the Ballot Box DB.
 * NOTE: There is NO voter_id column to guarantee absolute ballot secrecy.
 */
export interface Ballot {
  id: string;
  electionId: string;
  encryptedPayload: string; // AES-256-GCM ciphertext + IV + auth tag
  receiptCode: string;      // Public receipt identifier e.g. REC-A7F920
  receiptHash: string;      // SHA-256(receiptCode + ciphertext)
  merkleLeafHash: string;   // RFC 6962 leaf hash in Merkle Tree
  roundedTimestamp: Date;   // Rounded to the hour to thwart timing side-channel attacks
  sealedAt: Date;
}
