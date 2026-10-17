/**
 * SQLite to PostgreSQL Migration Utility
 * Migrates existing SQLite data (voters, elections, candidates, wallets, audit transactions)
 * into PostgreSQL tables with schema integrity and deduplication.
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { getPgPool, initPostgresSchema } = require('./connection');

const SQLITE_PATH = path.join(__dirname, 'vote_wallet.sqlite');

async function migrateData() {
  if (!fs.existsSync(SQLITE_PATH)) {
    console.log(`ℹ️ No existing SQLite database found at ${SQLITE_PATH}. Skipping migration.`);
    return;
  }

  console.log(`📦 Initializing PostgreSQL Schema before migration...`);
  await initPostgresSchema();

  console.log(`🔍 Connecting to SQLite at ${SQLITE_PATH}...`);
  const sqliteDb = new sqlite3.Database(SQLITE_PATH);
  const pgPool = getPgPool();
  const pgClient = await pgPool.connect();

  const querySqlite = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  };

  try {
    await pgClient.query('BEGIN');

    // 1. Migrate Elections
    const elections = await querySqlite(`SELECT * FROM elections`);
    console.log(`Migrating ${elections.length} election records...`);
    for (const e of elections) {
      await pgClient.query(
        `INSERT INTO elections (id, title, status, opens_at, closes_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status`,
        [e.id, e.title, e.status, e.opens_at, e.closes_at]
      );
    }

    // 2. Migrate Voters
    const voters = await querySqlite(`SELECT * FROM voters`);
    console.log(`Migrating ${voters.length} voter records...`);
    for (const v of voters) {
      await pgClient.query(
        `INSERT INTO voters (id, voter_code, full_name, phone, photo_url, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (voter_code) DO NOTHING`,
        [v.id, v.voter_code, v.full_name, v.phone, v.photo_url, v.status || 'active']
      );
    }

    // 3. Migrate Candidates
    const candidates = await querySqlite(`SELECT * FROM candidates`);
    console.log(`Migrating ${candidates.length} candidate records...`);
    for (const c of candidates) {
      await pgClient.query(
        `INSERT INTO candidates (id, election_id, name, party, symbol, votes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET votes = EXCLUDED.votes`,
        [c.id, c.election_id || 1, c.name, c.party, c.symbol, c.votes || 0]
      );
    }

    // 4. Migrate Wallets
    const wallets = await querySqlite(`SELECT * FROM wallets`);
    console.log(`Migrating ${wallets.length} wallet records...`);
    for (const w of wallets) {
      await pgClient.query(
        `INSERT INTO wallets (id, label, address, credits)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (address) DO UPDATE SET credits = EXCLUDED.credits`,
        [w.id, w.label, w.address, w.credits]
      );
    }

    // 5. Migrate Transactions
    const txs = await querySqlite(`SELECT * FROM transactions`);
    console.log(`Migrating ${txs.length} audit ledger transactions...`);
    for (const t of txs) {
      await pgClient.query(
        `INSERT INTO transactions (id, tx_hash, prev_hash, action_type, detail, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.tx_hash, t.prev_hash, t.action_type, t.detail, t.created_at]
      );
    }

    // Reset PostgreSQL auto-increment sequences to match max imported IDs
    const tables = ['elections', 'voters', 'candidates', 'wallets', 'transactions'];
    for (const tbl of tables) {
      await pgClient.query(`
        SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE(max(id), 1)) FROM ${tbl};
      `);
    }

    await pgClient.query('COMMIT');
    console.log('✅ SQLite data successfully migrated to PostgreSQL!');
  } catch (err) {
    await pgClient.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    sqliteDb.close();
    pgClient.release();
    await pgPool.end();
  }
}

if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };
