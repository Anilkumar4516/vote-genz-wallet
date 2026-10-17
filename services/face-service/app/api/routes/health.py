from fastapi import APIRouter
from datetime import datetime
from app.db.session import db_manager
from app.services.challenge_store import challenge_store

router = APIRouter(tags=["Health"])

@router.get("/health")
async def get_health():
    db_ok = await db_manager.is_healthy()
    redis_ok = challenge_store.redis is not None

    is_healthy = db_ok and redis_ok
    return {
        "status": "UP" if is_healthy else "DEGRADED",
        "service": "face-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "dependencies": {
            "voterRegistryDb": "CONNECTED" if db_ok else "DISCONNECTED",
            "redisChallengeStore": "CONNECTED" if redis_ok else "LOCAL_FALLBACK",
        },
    }
