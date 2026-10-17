from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import logger
from app.db.session import db_manager
from app.services.challenge_store import challenge_store
from app.api.routes.verify import router as verify_router
from app.api.routes.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Bootstrapping Vote Wallet Face Service...")
    await db_manager.connect()
    await challenge_store.connect()
    yield
    logger.info("🛑 Shutting down Face Service and cleaning up connection pools...")
    await db_manager.disconnect()
    await challenge_store.disconnect()

app = FastAPI(
    title="Vote Wallet - Biometric Face Service",
    description="FastAPI service for facial template comparison (InsightFace ArcFace), interactive liveness verification, and memory-only encrypted template evaluation",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify_router)
app.include_router(health_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
