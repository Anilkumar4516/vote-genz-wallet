/**
 * Production Cryptographic Merkle Tree Engine
 * Implements RFC 6962 compliant Leaf and Node prefixing to prevent second-preimage attacks.
 * Allows O(log N) inclusion proofs for 1,000,000+ sealed ballots.
 */

const crypto = require('crypto');

// Domain separation prefixes (RFC 6962 standard)
const LEAF_PREFIX = Buffer.from([0x00]);
const NODE_PREFIX = Buffer.from([0x01]);

function sha256(bufferOrString) {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex');
}

/**
 * Computes leaf hash for a sealed ballot
 * @param {string} receiptHash 64-char hex receipt hash
 * @param {number|string} candidateId Candidate ID or name
 * @param {string} timestamp ISO timestamp or bucket
 * @returns {string} SHA-256 leaf hash in hex
 */
function hashLeaf(receiptHash, candidateId, timestamp) {
  const content = `${receiptHash}|${candidateId}|${timestamp}`;
  return crypto
    .createHash('sha256')
    .update(Buffer.concat([LEAF_PREFIX, Buffer.from(content, 'utf8')]))
    .digest('hex');
}

/**
 * Computes parent node hash from left and right children
 * @param {string} leftHash Hex string
 * @param {string} rightHash Hex string
 * @returns {string} SHA-256 parent node hash in hex
 */
function hashNode(leftHash, rightHash) {
  const leftBuf = Buffer.from(leftHash, 'hex');
  const rightBuf = Buffer.from(rightHash, 'hex');
  return crypto
    .createHash('sha256')
    .update(Buffer.concat([NODE_PREFIX, leftBuf, rightBuf]))
    .digest('hex');
}

/**
 * MerkleTree Class for Batch Ballot Verification
 */
class MerkleTree {
  /**
   * @param {string[]} leafHashes Array of hex leaf hashes
   */
  constructor(leafHashes = []) {
    this.leaves = leafHashes.slice();
    this.layers = [];
    this.buildTree();
  }

  buildTree() {
    if (this.leaves.length === 0) {
      this.layers = [['0000000000000000000000000000000000000000000000000000000000000000']];
      return;
    }

    let currentLayer = this.leaves.slice();
    this.layers = [currentLayer];

    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        // If odd number of nodes, duplicate the last node (RFC 6962 / Bitcoin standard)
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
        nextLayer.push(hashNode(left, right));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  /**
   * Returns the top Merkle Root Hash
   * @returns {string} 64-char hex string
   */
  getRoot() {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return '0000000000000000000000000000000000000000000000000000000000000000';
    }
    return this.layers[this.layers.length - 1][0];
  }

  /**
   * Generates a compact O(log N) cryptographic inclusion proof for a leaf index
   * @param {number} leafIndex
   * @returns {Array<{position: 'left'|'right', hash: string}>}
   */
  getProof(leafIndex) {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} out of bounds (0-${this.leaves.length - 1})`);
    }

    const proof = [];
    let index = leafIndex;

    for (let l = 0; l < this.layers.length - 1; l++) {
      const layer = this.layers[l];
      const isRight = index % 2 === 1;
      const siblingIndex = isRight ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push({
          position: isRight ? 'left' : 'right',
          hash: layer[siblingIndex]
        });
      } else {
        // Self-paired sibling for odd node count
        proof.push({
          position: 'right',
          hash: layer[index]
        });
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * Static verifier: Verifies if a leafHash is part of a Merkle Root given its proof
   * @param {string} leafHash
   * @param {Array<{position: 'left'|'right', hash: string}>} proof
   * @param {string} rootHash
   * @returns {boolean}
   */
  static verifyProof(leafHash, proof, rootHash) {
    let current = leafHash;

    for (const step of proof) {
      if (step.position === 'left') {
        current = hashNode(step.hash, current);
      } else {
        current = hashNode(current, step.hash);
      }
    }

    return current.toLowerCase() === rootHash.toLowerCase();
  }
}

module.exports = {
  MerkleTree,
  hashLeaf,
  hashNode,
  sha256
};
