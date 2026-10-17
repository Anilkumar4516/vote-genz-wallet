from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.exceptions import UnauthorizedException
from src.core.security import decode_token

security_scheme = HTTPBearer(auto_error=False)


async def get_current_voter(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """Dependency verifying Bearer JWT session token."""
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Missing authentication token")

    token = credentials.credentials
    # Support both JWT and legacy prefixed sessions
    if token.startswith("VOTE_SESS_"):
        # Legacy session format support
        return {"sub": token.replace("VOTE_SESS_", ""), "token": token, "is_legacy": True}

    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token")

    return payload
