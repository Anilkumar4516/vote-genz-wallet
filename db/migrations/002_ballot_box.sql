-- ====================================================================
-- DATABASE 2: BALLOT BOX DATABASE
-- Completely separated database. Houses candidate slates, zero-knowledge
-- vote tokens, encrypted ballots, and the Merkle tree ledger.
-- ZERO voter ID columns exist in this database.
-- ====================================================================

CREATE TABLE IF NOT EXISTS elections (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    constituency VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'UPCOMING', -- UPCOMING, OPEN, CLOSED, TALLIED
    public_key TEXT NOT NULL,                        -- Asymmetric election encryption public key
    opens_at TIMESTAMP WITH TIME ZONE NOT NULL,
    closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(64) PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);

-- Single-Use Anonymous Vote Tokens
-- Issued after biometric authorization; dissociated from voter identity
CREATE TABLE IF NOT EXISTS vote_tokens (
    token_hash VARCHAR(64) PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL REFERENCES elections(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_spent BOOLEAN NOT NULL DEFAULT FALSE,
    spent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_vote_tokens_election ON vote_tokens(election_id);

-- Encrypted Ballots: NO VOTER ID COLUMN ALLOWED
CREATE TABLE IF NOT EXISTS ballots (
    id VARCHAR(64) PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL REFERENCES elections(id),
    encrypted_payload TEXT NOT NULL,                 -- Ciphertext encrypted with election public key
    tracker_hash VARCHAR(64) NOT NULL UNIQUE,       -- Citizen verification receipt hash
    merkle_index INTEGER NOT NULL,
    merkle_leaf_hash VARCHAR(64) NOT NULL,
    cast_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ballots_election ON ballots(election_id);
CREATE INDEX IF NOT EXISTS idx_ballots_tracker ON ballots(tracker_hash);

-- Merkle Tree Snapshots & Roots for Public Bulletin Board
CREATE TABLE IF NOT EXISTS merkle_snapshots (
    id SERIAL PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL REFERENCES elections(id),
    leaf_count INTEGER NOT NULL,
    root_hash VARCHAR(64) NOT NULL,
    tree_depth INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_merkle_election ON merkle_snapshots(election_id);
