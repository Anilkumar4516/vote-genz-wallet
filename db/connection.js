/**
 * PostgreSQL Connection Pool & Drizzle ORM Initializer
 * Configured with resilient connection pooling, keepalive, and automated DDL initialization.
 */

const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('./schema');

let pool = null;
let db = null;
let isPostgresReady = false;

function getPgConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
  }

  return {
    host: process.env.PGHOST || '127.0.0.1',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'vote_wallet',
    max: parseInt(process.env.PG_MAX_CONNECTIONS || '30', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
}

function getPgPool() {
  if (pool) return pool;

  const config = getPgConfig();
  pool = new Pool(config);

  pool.on('error', (err) => {
    isPostgresReady = false;
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`⚠️ PostgreSQL Pool Error: ${err.message}`);
    }
  });

  db = drizzle(pool, { schema });
  return pool;
}

function getDrizzleDb() {
  if (!db) {
    getPgPool();
  }
  return db;
}

/**
 * Initializes tables and indexes in PostgreSQL if they don't already exist
 */
async function initPostgresSchema() {
  const currentPool = getPgPool();
  const client = await currentPool.connect();

  try {
    await client.query('BEGIN');

    // 1. Elections Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS elections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        opens_at TIMESTAMPTZ NOT NULL,
        closes_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Voters Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS voters (
        id SERIAL PRIMARY KEY,
        voter_code VARCHAR(64) UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone VARCHAR(32) NOT NULL,
        photo_url TEXT,
        status VARCHAR(32) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone);
      CREATE INDEX IF NOT EXISTS idx_voters_code ON voters(voter_code);
    `);

    // 3. Voter Participation Table (Enforces 1 vote per citizen per election at DB level)
    await client.query(`
      CREATE TABLE IF NOT EXISTS voter_participation (
        voter_id INTEGER NOT NULL,
        election_id INTEGER NOT NULL,
        voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (voter_id, election_id)
      );
      CREATE INDEX IF NOT EXISTS idx_participation_election ON voter_participation(election_id);
    `);

    // 4. Anonymous Vote Tokens Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vote_tokens (
        token_hash VARCHAR(64) PRIMARY KEY,
        election_id INTEGER NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used INTEGER DEFAULT 0,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tokens_election ON vote_tokens(election_id, used);
    `);

    // 5. Ballots Table (Encrypted choice, receipt hash, NO voter link)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ballots (
        id SERIAL PRIMARY KEY,
        election_id INTEGER NOT NULL,
        candidate_choice_encrypted TEXT NOT NULL,
        receipt_hash VARCHAR(64) UNIQUE NOT NULL,
        created_hour VARCHAR(32) NOT NULL,
        merkle_leaf_hash VARCHAR(64),
        merkle_batch_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_ballots_receipt ON ballots(receipt_hash);
      CREATE INDEX IF NOT EXISTS idx_ballots_election ON ballots(election_id);
    `);

    // 6. Candidates Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        election_id INTEGER NOT NULL DEFAULT 1,
        name TEXT NOT NULL,
        party TEXT DEFAULT 'Independent',
        symbol TEXT DEFAULT '',
        votes INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Audit Log / Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        tx_hash VARCHAR(64) NOT NULL,
        prev_hash VARCHAR(64) NOT NULL,
        action_type VARCHAR(64) NOT NULL,
        detail TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at);
    `);

    // 8. Merkle Batches Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS merkle_batches (
        id SERIAL PRIMARY KEY,
        election_id INTEGER NOT NULL,
        root_hash VARCHAR(64) NOT NULL,
        start_ballot_id INTEGER NOT NULL,
        end_ballot_id INTEGER NOT NULL,
        leaf_count INTEGER NOT NULL,
        anchored_tx_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 9. Biometric Audits Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS biometric_audits (
        id SERIAL PRIMARY KEY,
        voter_id INTEGER NOT NULL,
        voter_code VARCHAR(64) NOT NULL,
        full_name TEXT NOT NULL,
        auth_type VARCHAR(64) NOT NULL,
        confidence DOUBLE PRECISION NOT NULL,
        liveness_passed INTEGER NOT NULL DEFAULT 1,
        audit_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 10. Persistent Voter Sessions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS voter_sessions (
        token VARCHAR(128) PRIMARY KEY,
        voter_id INTEGER NOT NULL,
        voter_code VARCHAR(64) NOT NULL,
        face_verified INTEGER DEFAULT 0,
        bio_verified INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
    `);

    // 11. Wallets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL,
        address VARCHAR(64) UNIQUE NOT NULL,
        credits INTEGER NOT NULL DEFAULT 20,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    isPostgresReady = true;
    console.log('✅ PostgreSQL Schema Verified & Initialized');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize PostgreSQL schema:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getPgPool,
  getDrizzleDb,
  initPostgresSchema,
  isReady: () => isPostgresReady
};
