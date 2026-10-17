from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, PrimaryKeyConstraint, Index
from src.core.database import Base


class Election(Base):
    __tablename__ = "elections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    status = Column(String(32), default="open", nullable=False)
    opens_at = Column(DateTime, nullable=False)
    closes_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    election_id = Column(Integer, default=1, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    party = Column(String(255), default="Independent")
    symbol = Column(String(255), default="")
    votes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class VoterParticipation(Base):
    __tablename__ = "voter_participation"

    voter_id = Column(Integer, nullable=False)
    election_id = Column(Integer, nullable=False)
    voted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("voter_id", "election_id"),
        Index("idx_voter_part_election", "election_id"),
    )


class VoteToken(Base):
    __tablename__ = "vote_tokens"

    token_hash = Column(String(64), primary_key=True)
    election_id = Column(Integer, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Integer, default=0, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Ballot(Base):
    __tablename__ = "ballots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    election_id = Column(Integer, nullable=False, index=True)
    candidate_choice_encrypted = Column(Text, nullable=False)
    receipt_hash = Column(String(64), unique=True, nullable=False, index=True)
    created_hour = Column(String(32), nullable=False)
    merkle_leaf_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
