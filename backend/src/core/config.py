from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Production Environment Settings via Pydantic v2."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "vote-wallet-backend"
    ENV: str = "development"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security
    SECRET_KEY: str = Field(default="dev-insecure-secret-key-replace-in-production-32-chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ELECTION_MASTER_SECRET: str = "virtual-election-vote-wallet-master-key-2026"

    # Database
    DATABASE_URL: str = "sqlite:///./vote_wallet.sqlite3"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str | None = None
    REDIS_DB: int = 0
    REDIS_STREAM_KEY: str = "elections:ballot_stream"
    REDIS_CONSUMER_GROUP: str = "voting_workers"

    # Rate Limiting
    RATE_LIMIT_AUTH: int = 10
    RATE_LIMIT_AUTH_WINDOW: int = 60
    RATE_LIMIT_VOTE: int = 5
    RATE_LIMIT_VOTE_WINDOW: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()
