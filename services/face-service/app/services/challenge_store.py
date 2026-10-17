import redis.asyncio as aioredis
import secrets
import json
from typing import Optional, List, Dict
from app.core.config import settings
from app.core.logging import logger

LIVENESS_ACTION_POOLS = [
    ["BLINK", "HEAD_TURN_LEFT"],
    ["BLINK", "HEAD_TURN_RIGHT"],
    ["SMILE", "BLINK"],
    ["HEAD_TURN_RIGHT", "BLINK"],
]

class ChallengeStore:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.local_cache: Dict[str, dict] = {}

    async def connect(self):
        try:
            self.redis = aioredis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD or None,
                decode_responses=True,
                socket_timeout=5,
            )
            await self.redis.ping()
            logger.info("Connected to Redis for Biometric Challenge Store")
        except Exception as e:
            logger.warning(f"Redis challenge store offline (using in-memory fallback): {e}")
            self.redis = None

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    async def create_challenge(self, national_id: str) -> dict:
        challenge_id = "fc_" + secrets.token_hex(16)
        # Random dynamic actions required from citizen to prevent video replay attacks
        selected_actions = secrets.choice(LIVENESS_ACTION_POOLS)

        challenge_data = {
            "challengeId": challenge_id,
            "nationalId": national_id,
            "requiredActions": selected_actions,
            "createdAt": secrets.token_hex(4),
        }

        if self.redis:
            await self.redis.set(
                f"face_challenge:{challenge_id}",
                json.dumps(challenge_data),
                ex=settings.CHALLENGE_TTL_SECONDS,
            )
        else:
            self.local_cache[challenge_id] = challenge_data

        logger.info(f"Issued random liveness challenge [{challenge_id}] for {national_id}: {selected_actions}")
        return challenge_data

    async def validate_and_consume_challenge(self, challenge_id: str, national_id: str) -> bool:
        if self.redis:
            data_raw = await self.redis.get(f"face_challenge:{challenge_id}")
            if not data_raw:
                return False
            data = json.loads(data_raw)
            # Burn challenge immediately to eliminate replay attacks
            await self.redis.delete(f"face_challenge:{challenge_id}")
            return data.get("nationalId") == national_id
        else:
            data = self.local_cache.pop(challenge_id, None)
            if not data:
                return False
            return data.get("nationalId") == national_id

challenge_store = ChallengeStore()
