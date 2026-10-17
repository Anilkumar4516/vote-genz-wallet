from sqlalchemy.orm import Session
from src.modules.wallet.models import Wallet, Transaction


class WalletRepository:
    """Database operations for citizen wallets and hash-chained audit transactions."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Wallet]:
        return self.db.query(Wallet).order_by(Wallet.id.asc()).all()

    def get_by_id(self, wallet_id: int) -> Wallet | None:
        return self.db.query(Wallet).filter(Wallet.id == wallet_id).first()

    def get_by_id_for_update(self, wallet_id: int) -> Wallet | None:
        """Pessimistic row-level locking for atomic balance updates."""
        return self.db.query(Wallet).filter(Wallet.id == wallet_id).with_for_update().first()

    def create(self, label: str, address: str, credits: int = 20) -> Wallet:
        wallet = Wallet(label=label, address=address, credits=credits)
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def get_latest_transaction(self) -> Transaction | None:
        return self.db.query(Transaction).order_by(Transaction.id.desc()).first()

    def record_transaction(self, tx_hash: str, prev_hash: str, action_type: str, detail: str) -> Transaction:
        tx = Transaction(
            tx_hash=tx_hash,
            prev_hash=prev_hash,
            action_type=action_type,
            detail=detail
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)
        return tx

    def get_recent_transactions(self, limit: int = 20) -> list[Transaction]:
        return self.db.query(Transaction).order_by(Transaction.id.desc()).limit(limit).all()
