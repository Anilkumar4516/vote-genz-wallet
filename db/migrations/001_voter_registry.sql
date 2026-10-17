-- ====================================================================
-- DATABASE 1: VOTER REGISTRY DATABASE
-- Contains citizen identities, demographic roll, and participation tracking.
-- Physical database isolation: This DB has NO ACCESS to ballot contents.
-- ====================================================================

CREATE TABLE IF NOT EXISTS voters (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(64) NOT NULL UNIQUE,       -- EPIC / National Identity Number
    voter_hash VARCHAR(64) NOT NULL UNIQUE,         -- Pseudonymous HMAC hash
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    constituency_code VARCHAR(64) NOT NULL,
    polling_station VARCHAR(255) NOT NULL,
    photo_url TEXT,
    face_template_hash VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voters_national_id ON voters(national_id);
CREATE INDEX IF NOT EXISTS idx_voters_constituency ON voters(constituency_code);

-- Participation Table: Records ONLY THAT a citizen voted, never WHAT they voted
CREATE TABLE IF NOT EXISTS voter_participation (
    id SERIAL PRIMARY KEY,
    voter_id INTEGER NOT NULL REFERENCES voters(id),
    election_id VARCHAR(64) NOT NULL,
    participated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    channel VARCHAR(32) DEFAULT 'MOBILE_APP',
    CONSTRAINT uq_voter_election UNIQUE (voter_id, election_id)
);

CREATE INDEX IF NOT EXISTS idx_participation_election ON voter_participation(election_id);

-- System and Administrative Audit Logs with SHA-256 Hash Chaining
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource_id VARCHAR(64),
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(64),
    prev_hash VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
