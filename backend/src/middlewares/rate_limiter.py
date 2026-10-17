from fastapi import Request
from src.core.redis import check_rate_limit
from src.core.exceptions import RateLimitException
from src.core.config import get_settings

settings = get_settings()


async def rate_limit_auth(request: Request):
    """Enforces sliding-window rate limit on authentication endpoints."""
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    key = f"ratelimit:auth:{client_ip}"
    allowed, _ = check_rate_limit(key, settings.RATE_LIMIT_AUTH, settings.RATE_LIMIT_AUTH_WINDOW)
    if not allowed:
        raise RateLimitException("Authentication rate limit exceeded. Please wait 1 minute.")


async def rate_limit_vote(request: Request):
    """Enforces sliding-window rate limit on voting endpoints."""
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    key = f"ratelimit:vote:{client_ip}"
    allowed, _ = check_rate_limit(key, settings.RATE_LIMIT_VOTE, settings.RATE_LIMIT_VOTE_WINDOW)
    if not allowed:
        raise RateLimitException("Vote casting rate limit exceeded. Please wait.")
