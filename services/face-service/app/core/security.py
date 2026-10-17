from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings
import secrets

api_key_header = APIKeyHeader(name="X-Internal-Secret", auto_error=False)

def verify_internal_service_secret(secret: str = Security(api_key_header)) -> bool:
    """
    Validates service-to-service inter-cluster authentication token using constant-time comparison
    """
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required X-Internal-Secret header",
        )

    expected = settings.INTERNAL_SERVICE_SECRET
    if not secrets.compare_digest(secret, expected):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid inter-service authentication credentials",
        )

    return True
