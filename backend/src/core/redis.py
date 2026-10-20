import time
import logging
import redis
from src.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis_pool = None
_last_failure_time = 0.0
FAILURE_COOLDOWN_SEC = 5.0


def get_redis_client() -> redis.Redis | None:
    """Returns a pooled Redis client or None if Redis is unreachable. Uses a cooldown cache when offline."""
    global _redis_pool, _last_failure_time
    now = time.time()
    if now - _last_failure_time < FAILURE_COOLDOWN_SEC:
        return None

    if _redis_pool is None:
        try:
            _redis_pool = redis.ConnectionPool(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                db=settings.REDIS_DB,
                decode_responses=True,
                socket_timeout=1.0,
                socket_connect_timeout=1.0,
                max_connections=50
            )
        except Exception as e:
            _last_failure_time = now
            logger.warning(f"Failed to initialize Redis connection pool: {e}")
            return None

    try:
        client = redis.Redis(connection_pool=_redis_pool)
        client.ping()
        return client
    except Exception as e:
        _last_failure_time = now
        logger.warning(f"Redis unavailable ({e}), operating in local fallback.")
        return None


# Atomic Lua script for instant one-person-one-vote participation check & token burning
ATOMIC_BURN_LUA = """
local participationKey = KEYS[1]
local tokenKey = KEYS[2]
local voterId = ARGV[1]
local timestamp = ARGV[2]

if redis.call('SISMEMBER', participationKey, voterId) == 1 then
    return 'ALREADY_VOTED'
end

local used = redis.call('HGET', tokenKey, 'used')
if not used then
    return 'TOKEN_NOT_FOUND'
end
if used == '1' then
    return 'TOKEN_ALREADY_USED'
end

redis.call('HSET', tokenKey, 'used', '1', 'used_at', timestamp)
redis.call('SADD', participationKey, voterId)
return 'SUCCESS'
"""


def enqueue_ballot_stream(payload: dict) -> str | None:
    """Publishes a ballot cast payload to Redis Streams for background persistence."""
    client = get_redis_client()
    if not client:
        return None

    try:
        msg_id = client.xadd(
            settings.REDIS_STREAM_KEY,
            {"payload": str(payload), "created_at": str(time.time())}
        )
        return msg_id
    except Exception as e:
        logger.error(f"Failed to enqueue ballot to Redis stream: {e}")
        return None


def check_rate_limit(key: str, limit: int, window_sec: int) -> tuple[bool, int]:
    """Sliding-window distributed rate limiter via Redis."""
    client = get_redis_client()
    if not client:
        return True, limit

    now = time.time()
    clear_before = now - window_sec
    pipe = client.pipeline()
    pipe.zremrangebyscore(key, 0, clear_before)
    pipe.zadd(key, {f"{now}": now})
    pipe.zcard(key)
    pipe.expire(key, window_sec)
    results = pipe.execute()

    count = results[2]
    return count <= limit, max(0, limit - count)


REDIS_PUBSUB_CHANNEL = "election:events"


def publish_election_event(event_type: str, data: dict) -> bool:
    """Publishes a real-time event across the distributed Redis cluster."""
    import json
    client = get_redis_client()
    if not client:
        return False
    try:
        message = json.dumps({
            "type": event_type,
            "data": data,
            "timestamp": time.time()
        })
        client.publish(REDIS_PUBSUB_CHANNEL, message)
        return True
    except Exception as e:
        logger.error(f"Failed to publish election event: {e}")
        return False
