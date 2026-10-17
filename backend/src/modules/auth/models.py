from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from src.core.database import Base


class VoterSession(Base):
    __tablename__ = "voter_sessions"

    token = Column(String(128), primary_key=True)
    voter_id = Column(Integer, nullable=False)
    voter_code = Column(String(64), nullable=False)
    face_verified = Column(Integer, default=0)
    bio_verified = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)


class BiometricAudit(Base):
    __tablename__ = "biometric_audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    voter_id = Column(Integer, nullable=False)
    voter_code = Column(String(64), nullable=False)
    full_name = Column(String(255), nullable=False)
    auth_type = Column(String(64), nullable=False)
    confidence = Column(Float, nullable=False)
    liveness_passed = Column(Integer, default=1)
    audit_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
