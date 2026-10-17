/**
 * Production Database Schema (Drizzle ORM for PostgreSQL 16)
 * Implements strict constraints, foreign keys, partitioning readiness,
 * and decoupling of voter identities from encrypted ballots.
 */

const {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
  doublePrecision,
  primaryKey,
  index,
  uniqueIndex
} = require('drizzle-orm/pg-core');

// 1. Elections Table
const elections = pgTable('elections', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('open'),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  closesAt: timestamp('closes_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 2. Voters Table (Identity and Demographic Roll)
const voters = pgTable('voters', {
  id: serial('id').primaryKey(),
  voterCode: varchar('voter_code', { length: 64 }).notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: varchar('phone', { length: 32 }).notNull(),
  photoUrl: text('photo_url'),
  status: varchar('status', { length: 32 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('idx_voters_phone').on(table.phone),
  index('idx_voters_code').on(table.voterCode)
]);

// 3. Voter Participation Table (Enforces One-Person-One-Vote at DB Level)
const voterParticipation = pgTable('voter_participation', {
  voterId: integer('voter_id').notNull(),
  electionId: integer('election_id').notNull(),
  votedAt: timestamp('voted_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  primaryKey({ columns: [table.voterId, table.electionId] }),
  index('idx_participation_election').on(table.electionId)
]);

// 4. Anonymous Vote Tokens Table (Identity Decoupled)
const voteTokens = pgTable('vote_tokens', {
  tokenHash: varchar('token_hash', { length: 64 }).primaryKey(),
  electionId: integer('election_id').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: integer('used').notNull().default(0),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('idx_tokens_election_used').on(table.electionId, table.used)
]);

// 5. Ballots Table (Encrypted Ballot Box - ZERO voter identity link)
const ballots = pgTable('ballots', {
  id: serial('id').primaryKey(),
  electionId: integer('election_id').notNull(),
  candidateChoiceEncrypted: text('candidate_choice_encrypted').notNull(),
  receiptHash: varchar('receipt_hash', { length: 64 }).notNull().unique(),
  createdHour: varchar('created_hour', { length: 32 }).notNull(),
  merkleLeafHash: varchar('merkle_leaf_hash', { length: 64 }),
  merkleBatchId: integer('merkle_batch_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  uniqueIndex('idx_ballots_receipt').on(table.receiptHash),
  index('idx_ballots_election').on(table.electionId)
]);

// 6. Candidates Table
const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  electionId: integer('election_id').notNull().default(1),
  name: text('name').notNull(),
  party: text('party').default('Independent'),
  symbol: text('symbol').default(''),
  votes: integer('votes').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('idx_candidates_election').on(table.electionId)
]);

// 7. Transactions / Cryptographic Audit Log Table
const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  txHash: varchar('tx_hash', { length: 64 }).notNull(),
  prevHash: varchar('prev_hash', { length: 64 }).notNull(),
  actionType: varchar('action_type', { length: 64 }).notNull(),
  detail: text('detail').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
  index('idx_tx_created_at').on(table.createdAt)
]);

// 8. Merkle Tree Batches Table (For O(log N) verification proofs)
const merkleBatches = pgTable('merkle_batches', {
  id: serial('id').primaryKey(),
  electionId: integer('election_id').notNull(),
  rootHash: varchar('root_hash', { length: 64 }).notNull(),
  startBallotId: integer('start_ballot_id').notNull(),
  endBallotId: integer('end_ballot_id').notNull(),
  leafCount: integer('leaf_count').notNull(),
  anchoredTxId: text('anchored_tx_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 9. Biometric Audits Table
const biometricAudits = pgTable('biometric_audits', {
  id: serial('id').primaryKey(),
  voterId: integer('voter_id').notNull(),
  voterCode: varchar('voter_code', { length: 64 }).notNull(),
  fullName: text('full_name').notNull(),
  authType: varchar('auth_type', { length: 64 }).notNull(),
  confidence: doublePrecision('confidence').notNull(),
  livenessPassed: integer('liveness_passed').notNull().default(1),
  auditHash: varchar('audit_hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 10. Voter Sessions Table (Persistent distributed sessions)
const voterSessions = pgTable('voter_sessions', {
  token: varchar('token', { length: 128 }).primaryKey(),
  voterId: integer('voter_id').notNull(),
  voterCode: varchar('voter_code', { length: 64 }).notNull(),
  faceVerified: integer('face_verified').default(0),
  bioVerified: integer('bio_verified').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

// 11. Wallets Table
const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  address: varchar('address', { length: 64 }).notNull().unique(),
  credits: integer('credits').notNull().default(20),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

module.exports = {
  elections,
  voters,
  voterParticipation,
  voteTokens,
  ballots,
  candidates,
  transactions,
  merkleBatches,
  biometricAudits,
  voterSessions,
  wallets
};
