import asyncio
import json
import logging
import time
from typing import Set
from fastapi import WebSocket
from src.core.redis import get_redis_client, REDIS_PUBSUB_CHANNEL

logger = logging.getLogger("events")

# Active connection registries
_sse_queues: Set[asyncio.Queue] = set()
_ws_clients: Set[WebSocket] = set()
_subscriber_task = None


def format_sse(event_type: str, data: dict) -> str:
    payload = json.dumps({
        "type": event_type,
        "data": data,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    })
    return f"data: {payload}\n\n"


async def broadcast_local(event_type: str, data: dict):
    """Funnels an event to all local SSE and WebSocket connections."""
    sse_msg = format_sse(event_type, data)
    
    # 1. Dispatch to SSE queues
    dead_queues = set()
    for q in list(_sse_queues):
        try:
            q.put_nowait(sse_msg)
        except Exception:
            dead_queues.add(q)
    _sse_queues.difference_update(dead_queues)

    # 2. Dispatch to WebSocket clients
    dead_ws = set()
    ws_payload = json.dumps({"type": event_type, "data": data, "timestamp": time.time()})
    for ws in list(_ws_clients):
        try:
            await ws.send_text(ws_payload)
        except Exception:
            dead_ws.add(ws)
    _ws_clients.difference_update(dead_ws)


def broadcast_event(event_type: str, data: dict):
    """
    Publish event to distributed Redis Pub/Sub if available.
    Also broadcasts locally to ensure immediate zero-latency dispatch.
    """
    from src.core.redis import publish_election_event
    publish_election_event(event_type, data)
    
    # Run local dispatch in current event loop if running
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(broadcast_local(event_type, data))
    except RuntimeError:
        pass


def register_sse_client() -> asyncio.Queue:
    q = asyncio.Queue(maxsize=100)
    _sse_queues.add(q)
    return q


def unregister_sse_client(q: asyncio.Queue):
    _sse_queues.discard(q)


async def register_ws_client(ws: WebSocket):
    await ws.accept()
    _ws_clients.add(ws)


def unregister_ws_client(ws: WebSocket):
    _ws_clients.discard(ws)


def get_connected_clients_count() -> int:
    return len(_sse_queues) + len(_ws_clients)
