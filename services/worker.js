/**
 * Production Asynchronous Voting Ingestion Worker
 * Consumes ballots in high-throughput batches from Redis Streams,
 * executes atomic bulk persistence in PostgreSQL,
 * and generates Merkle Tree batch roots for inclusion proofs.
 */

require('dotenv').config();
const { getRedisClient, ensureConsumerGroup, isConnected } = require('./redis');
const { getPgPool } = require('../db/connection');
const { MerkleTree, hashLeaf } = require('./merkle');

const STREAM_KEY = process.env.VOTE_STREAM_KEY || 'election:1:ballot_stream';
const CONSUMER_GROUP = process.env.VOTE_CONSUMER_GROUP || 'voting_workers';
const CONSUMER_NAME = process.env.HOSTNAME || `worker-${process.pid}`;
const BATCH_SIZE = parseInt(process.env.VOTE_BATCH_SIZE || '100', 10);
const POLL_INTERVAL_MS = 1000;

let isRunning = true;

async function processBatch(messages, pool, redis) {
  if (!messages || messages.length === 0) return;

  const client = await pool.connect();
  const ackIds = [];

  try {
    await client.query('BEGIN');

    const leafHashes = [];
    const candidateVoteDeltas = {};

    for (const [msgId, fields] of messages) {
      ackIds.push(msgId);

      // Parse payload from Stream fields array
      let payload = null;
      for (let i = 0; i < fields.length; i += 2) {
        if (fields[i] === 'payload') {
          payload = JSON.parse(fields[i + 1]);
          break;
        }
      }

      if (!payload) continue;

      const {
        voterId,
        electionId,
        encryptedChoice,
        receiptHash,
        createdHour,
        candidateId,
        votedAt
      } = payload;

      // 1. Calculate Merkle Leaf Hash
      const leafHash = hashLeaf(receiptHash, candidateId, createdHour);
      leafHashes.push(leafHash);

      // 2. Insert into voter_participation (prevent duplicate at DB level)
      await client.query(
        `INSERT INTO voter_participation (voter_id, election_id, voted_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (voter_id, election_id) DO NOTHING`,
        [voterId, electionId, votedAt || new Date().toISOString()]
      );

      // 3. Insert into ballots (zero voter link)
      await client.query(
        `INSERT INTO ballots (election_id, candidate_choice_encrypted, receipt_hash, created_hour, merkle_leaf_hash)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (receipt_hash) DO NOTHING`,
        [electionId, encryptedChoice, receiptHash, createdHour, leafHash]
      );

      // Accumulate vote count
      candidateVoteDeltas[candidateId] = (candidateVoteDeltas[candidateId] || 0) + 1;
    }

    // 4. Batch update candidate vote counts
    for (const [candId, count] of Object.entries(candidateVoteDeltas)) {
      await client.query(
        `UPDATE candidates SET votes = votes + $1 WHERE id = $2`,
        [count, parseInt(candId, 10)]
      );
    }

    // 5. Generate Merkle Tree for batch if leaves exist
    if (leafHashes.length > 0) {
      const tree = new MerkleTree(leafHashes);
      const rootHash = tree.getRoot();

      await client.query(
        `INSERT INTO merkle_batches (election_id, root_hash, start_ballot_id, end_ballot_id, leaf_count)
         VALUES ($1, $2, 0, 0, $3)`,
        [1, rootHash, leafHashes.length]
      );

      // Append ledger event
      await client.query(
        `INSERT INTO transactions (tx_hash, prev_hash, action_type, detail, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          rootHash,
          'MERKLE_BATCH_ROOT',
          'MERKLE_ROOT_SEALED',
          `Sealed Merkle root ${rootHash.substring(0, 16)}... covering ${leafHashes.length} ballots`,
          new Date().toISOString()
        ]
      );
    }

    await client.query('COMMIT');

    // 6. Acknowledge processed messages in Redis Stream
    if (ackIds.length > 0) {
      await redis.xack(STREAM_KEY, CONSUMER_GROUP, ...ackIds);
    }

    console.log(`⚡ [Worker ${CONSUMER_NAME}] Successfully committed batch of ${messages.length} ballots. Merkle Root sealed.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ [Worker ${CONSUMER_NAME}] Batch processing error:`, err.message);
  } finally {
    client.release();
  }
}

async function startWorker() {
  console.log(`🚀 Starting Asynchronous Ballot Ingestion Worker [${CONSUMER_NAME}]...`);

  const redis = getRedisClient();
  const pool = getPgPool();

  // Ensure Redis Stream & Consumer Group exist
  try {
    await ensureConsumerGroup(STREAM_KEY, CONSUMER_GROUP);
  } catch (err) {
    console.warn('Consumer group notice:', err.message);
  }

  while (isRunning) {
    try {
      // Read new messages from Redis Stream using XREADGROUP
      const response = await redis.xreadgroup(
        'GROUP', CONSUMER_GROUP, CONSUMER_NAME,
        'BLOCK', POLL_INTERVAL_MS,
        'COUNT', BATCH_SIZE,
        'STREAMS', STREAM_KEY, '>'
      );

      if (response && response.length > 0) {
        const [streamKey, messages] = response[0];
        if (messages && messages.length > 0) {
          await processBatch(messages, pool, redis);
        }
      }
    } catch (err) {
      if (isRunning) {
        console.error(`Worker loop error: ${err.message}. Retrying in 2 seconds...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  console.log(`🛑 Worker [${CONSUMER_NAME}] shut down gracefully.`);
}

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, draining worker queue...');
  isRunning = false;
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, draining worker queue...');
  isRunning = false;
});

if (require.main === module) {
  startWorker().catch(console.error);
}

module.exports = {
  startWorker,
  processBatch
};
