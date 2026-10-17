from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.modules.wallet.schemas import CreateWalletSchema, RechargeSchema
from src.modules.wallet.services import WalletService
from src.modules.voting.repository import VotingRepository

router = APIRouter(tags=["Wallets"])


@router.get("/api/wallets")
async def get_wallets(db: Session = Depends(get_db)):
    service = WalletService(db)
    return {"wallets": service.list_wallets()}


@router.post("/api/wallets")
async def create_wallet(payload: CreateWalletSchema, db: Session = Depends(get_db)):
    service = WalletService(db)
    return service.create_wallet(payload.label, payload.address, payload.credits)


@router.post("/api/wallet/recharge")
async def recharge_wallet(payload: RechargeSchema, db: Session = Depends(get_db)):
    service = WalletService(db)
    return service.recharge_credits(payload.wallet_id, payload.amount)


@router.get("/api/poll")
async def get_poll_dashboard(walletId: int = 1, db: Session = Depends(get_db)):
    """Backward-compatible dashboard endpoint returning wallets, active poll, and recent ledger."""
    wallet_svc = WalletService(db)
    voting_repo = VotingRepository(db)

    wallets = wallet_svc.list_wallets()
    active_wallet = next((w for w in wallets if w.id == walletId), wallets[0] if wallets else None)
    candidates = voting_repo.get_candidates(election_id=1)
    transactions = wallet_svc.repo.get_recent_transactions(limit=20)

    return {
        "wallets": wallets,
        "activeWallet": active_wallet,
        "candidates": candidates,
        "transactions": transactions
    }
