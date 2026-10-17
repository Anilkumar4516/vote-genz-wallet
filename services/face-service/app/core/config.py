import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", "3004"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Database
    VOTER_REGISTRY_DB_HOST: str = os.getenv("VOTER_REGISTRY_DB_HOST", "localhost")
    VOTER_REGISTRY_DB_PORT: int = int(os.getenv("VOTER_REGISTRY_DB_PORT", "5432"))
    VOTER_REGISTRY_DB_USER: str = os.getenv("VOTER_REGISTRY_DB_USER", "face_template_readonly")
    VOTER_REGISTRY_DB_PASS: str = os.getenv("VOTER_REGISTRY_DB_PASS", "secure_face_read_password")
    VOTER_REGISTRY_DB_NAME: str = os.getenv("VOTER_REGISTRY_DB_NAME", "vote_wallet_identity")
    VOTER_REGISTRY_DB_POOL_MIN: int = int(os.getenv("VOTER_REGISTRY_DB_POOL_MIN", "2"))
    VOTER_REGISTRY_DB_POOL_MAX: int = int(os.getenv("VOTER_REGISTRY_DB_POOL_MAX", "10"))

    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")

    # Security & Keys
    TEMPLATE_DECRYPTION_KEY: str = os.getenv(
        "TEMPLATE_DECRYPTION_KEY",
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    )
    INTERNAL_SERVICE_SECRET: str = os.getenv(
        "INTERNAL_SERVICE_SECRET",
        "sec_face_srv_internal_auth_token_88192"
    )

    # Thresholds
    FACE_MATCH_SIMILARITY_THRESHOLD: float = float(os.getenv("FACE_MATCH_SIMILARITY_THRESHOLD", "0.82"))
    LIVENESS_CONFIDENCE_THRESHOLD: float = float(os.getenv("LIVENESS_CONFIDENCE_THRESHOLD", "0.88"))
    CHALLENGE_TTL_SECONDS: int = int(os.getenv("CHALLENGE_TTL_SECONDS", "180"))

    # InsightFace weights cache
    MODELS_CACHE_DIR: str = os.getenv("MODELS_CACHE_DIR", os.path.join(os.path.dirname(__file__), "..", "models_cache"))

settings = Settings()
