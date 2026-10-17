from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from src.core.database import Base


class Voter(Base):
    __tablename__ = "voters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    voter_code = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(32), nullable=False, index=True)
    photo_url = Column(String(500), nullable=True)
    status = Column(String(32), default="active")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
