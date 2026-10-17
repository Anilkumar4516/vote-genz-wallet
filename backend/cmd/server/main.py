import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import get_settings
from src.core.database import engine, Base, SessionLocal
from src.core.exceptions import AppException
from src.core.redis import get_redis_client
from src.middlewares.request_logger import RequestLoggerMiddleware
from src.middlewares.error_handler import app_exception_handler, global_exception_handler
from src.modules.auth.controllers import router as auth_router
from src.modules.voting.controllers import router as voting_router
from src.modules.wallet.controllers import router as wallet_router
from src.modules.users.controllers import router as users_router
from src.modules.users.models import Voter
from src.modules.voting.models import Election, Candidate
from src.modules.wallet.models import Wallet

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")
logger = logging.getLogger("server")
settings = get_settings()


def seed_database_defaults():
    """Initializes tables and seeds founding roster data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Election 1
        if db.query(Election).count() == 0:
            db.add(Election(
                id=1,
                title="2026 Virtual Campus Presidential & General Election",
                status="open",
                opens_at=Base.metadata.tables["elections"].c.created_at.default.arg(None),
                closes_at=Base.metadata.tables["elections"].c.created_at.default.arg(None)
            ))
            db.commit()

        # Seed Voters
        if db.query(Voter).count() == 0:
            default_voters = [
                Voter(voter_code="VOTER-SAN8639", full_name="Sandeep", phone="+91 86393 97906", photo_url="/voters/sandeep.jpg"),
                Voter(voter_code="VOTER-ANI9704", full_name="Anil", phone="+91 97048 18549", photo_url="/voters/anil.jpg"),
                Voter(voter_code="VOTER-DIV9347", full_name="Diva", phone="+91 93476 78271", photo_url="/voters/diva.png"),
                Voter(voter_code="VOTER-HAR9704", full_name="Harsh", phone="+91 97048 1854", photo_url="/voters/harsh.png")
            ]
            db.add_all(default_voters)
            db.commit()

        # Seed Candidates
        if db.query(Candidate).count() == 0:
            default_candidates = [
                Candidate(id=1, name="Sandeep", party="Tech & AI Alliance", symbol="", votes=0),
                Candidate(id=2, name="Anil", party="Campus Progress Coalition", symbol="", votes=0),
                Candidate(id=3, name="Diva", party="Green & Sustainability Front", symbol="", votes=0),
                Candidate(id=4, name="Harsh", party="Future Leaders Council", symbol="", votes=0)
            ]
            db.add_all(default_candidates)
            db.commit()

        # Seed Wallets
        if db.query(Wallet).count() == 0:
            default_wallets = [
                Wallet(id=1, label="Wallet 1 (Sandeep)", address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e", credits=20),
                Wallet(id=2, label="Wallet 2 (Anil)", address="0x534649708CabFD6f5174e95747356c323f4c8032", credits=20),
                Wallet(id=3, label="Wallet 3 (Diva)", address="0x8ba1f109551bD432803012645Ac136ddd64DBA72", credits=20),
                Wallet(id=4, label="Wallet 4 (Harsh)", address="0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A", credits=20)
            ]
            db.add_all(default_wallets)
            db.commit()
    finally:
        db.close()

# Auto-initialize database tables and default roster
seed_database_defaults()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing production database schemas and defaults...")
    seed_database_defaults()
    redis_client = get_redis_client()
    logger.info(f"Redis Status: {'Connected' if redis_client else 'Fallback Mode'}")
    yield
    logger.info("Server shutting down cleanly.")


app = FastAPI(
    title="Vote Wallet Production API",
    version="2.0.0",
    description="High-Throughput Cryptographic Voting & Wallet Ledger Architecture",
    lifespan=lifespan
)

# Global Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggerMiddleware)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Mount Domain Routers
app.include_router(auth_router)
app.include_router(voting_router)
app.include_router(wallet_router)
app.include_router(users_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Production readiness & liveness probe."""
    redis_client = get_redis_client()
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENV,
        "database": "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite",
        "redis": "connected" if redis_client else "offline_fallback"
    }
