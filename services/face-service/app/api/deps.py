from fastapi import Depends, HTTPException, status
from app.core.security import verify_internal_service_secret
from app.db.session import db_manager
import asyncpg
from typing import AsyncGenerator

async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """
    Yields database connection with restricted template read-only permissions
    """
    if not db_manager.pool:
        # Yield None if running offline in test/mock mode
        yield None
        return

    async with db_manager.pool.acquire() as conn:
        yield conn

def require_service_auth(is_authenticated: bool = Depends(verify_internal_service_secret)) -> bool:
    """
    Dependency enforcing service-to-service cluster authentication
    """
    return is_authenticated
