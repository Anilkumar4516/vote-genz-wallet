from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import QueuePool, StaticPool
from src.core.config import get_settings

settings = get_settings()

connect_args = {}
pool_kwargs = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    pool_kwargs["poolclass"] = StaticPool
else:
    pool_kwargs["poolclass"] = QueuePool
    pool_kwargs["pool_size"] = settings.DB_POOL_SIZE
    pool_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    pool_kwargs["pool_timeout"] = settings.DB_POOL_TIMEOUT
    pool_kwargs["pool_pre_ping"] = True

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **pool_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency for database session management with auto-cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
