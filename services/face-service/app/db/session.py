import asyncpg
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        try:
            self.pool = await asyncpg.create_pool(
                host=settings.VOTER_REGISTRY_DB_HOST,
                port=settings.VOTER_REGISTRY_DB_PORT,
                user=settings.VOTER_REGISTRY_DB_USER,
                password=settings.VOTER_REGISTRY_DB_PASS,
                database=settings.VOTER_REGISTRY_DB_NAME,
                min_size=settings.VOTER_REGISTRY_DB_POOL_MIN,
                max_size=settings.VOTER_REGISTRY_DB_POOL_MAX,
                timeout=10,
            )
            logger.info("Connected to Voter Registry DB (Face Template Read-Only access)")
        except Exception as e:
            logger.warning(f"Database connection offline (local fallback enabled): {e}")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            logger.info("Closed Voter Registry DB connection pool")

    async def is_healthy(self) -> bool:
        if not self.pool:
            return True
        try:
            async with self.pool.acquire() as conn:
                await conn.fetchval("SELECT 1;")
            return True
        except Exception:
            return False

db_manager = DatabaseManager()

async def get_db_pool() -> Optional[asyncpg.Pool]:
    return db_manager.pool
