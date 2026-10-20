import asyncio
import time
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.events import (
    register_sse_client,
    unregister_sse_client,
    register_ws_client,
    unregister_ws_client,
    format_sse,
    get_connected_clients_count
)
from src.modules.admin.services import AdminService
from src.modules.admin.schemas import (
    CloseElectionResponse,
    ReopenElectionResponse,
    TallyElectionResponse,
    ResetElectionResponse,
    VerifyChainResponse
)

router = APIRouter(tags=["Election Administration & Real-Time Auditing"])


@router.post("/api/admin/elections/{election_id}/close", response_model=CloseElectionResponse)
async def close_election(election_id: int = 1, db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.close_election(election_id)


@router.post("/api/admin/elections/{election_id}/reopen", response_model=ReopenElectionResponse)
async def reopen_election(election_id: int = 1, db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.reopen_election(election_id)


@router.post("/api/admin/elections/{election_id}/tally", response_model=TallyElectionResponse)
async def tally_election(election_id: int = 1, db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.tally_election(election_id)


@router.post("/api/admin/reset-election", response_model=ResetElectionResponse)
async def reset_election(db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.reset_election(election_id=1)


@router.get("/api/audit/verify-chain", response_model=VerifyChainResponse)
async def verify_chain(db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.verify_audit_chain()


@router.get("/api/audit/biometrics")
async def get_biometric_audits(db: Session = Depends(get_db)):
    service = AdminService(db)
    return {"audits": service.get_biometric_audits()}


@router.get("/api/election/live-stats")
async def get_live_stats(election_id: int = 1, db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.get_live_stats(election_id)


@router.get("/api/election/stream")
async def election_sse_stream():
    """
    Real-Time Server-Sent Events (SSE) live push stream.
    Broadcasts real-time ballot castings, Merkle batch sealings, and ledger blocks.
    """
    queue = register_sse_client()

    async def sse_generator():
        try:
            # Initial handshake
            yield format_sse("CONNECTED", {
                "active_clients": get_connected_clients_count(),
                "stream": "election:live"
            })
            
            while True:
                try:
                    # Wait for an event with a 15-second heartbeat timeout
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield msg
                except asyncio.TimeoutError:
                    yield format_sse("HEARTBEAT", {"time": time.time()})
        except asyncio.CancelledError:
            pass
        finally:
            unregister_sse_client(queue)

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.websocket("/ws/election")
async def election_websocket(websocket: WebSocket):
    """Duplex WebSocket endpoint for real-time live election and ledger streaming."""
    await register_ws_client(websocket)
    try:
        # Initial greeting
        await websocket.send_json({
            "type": "CONNECTED",
            "active_clients": get_connected_clients_count(),
            "timestamp": time.time()
        })
        while True:
            # Keep connection open and receive any ping/commands from client
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        unregister_ws_client(websocket)
    except Exception:
        unregister_ws_client(websocket)
