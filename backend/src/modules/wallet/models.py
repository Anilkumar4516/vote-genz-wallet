from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from src.core.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    label = Column(String(255), nullable=False)
    address = Column(String(64), unique=True, nullable=False, index=True)
    credits = Column(Integer, default=20, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Transaction(Base):
    """Hash-chained audit transaction ledger."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tx_hash = Column(String(64), nullable=False, index=True)
    prev_hash = Column(String(64), nullable=False)
    action_type = Column(String(64), nullable=False)
    detail = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
