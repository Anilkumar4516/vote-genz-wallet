import secrets
import hashlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.core.exceptions import NotFoundException
from src.modules.wallet.repository import WalletRepository


class WalletService:
    """Wallet balance management with atomic row-locking and SHA-256 chained audit logs."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = WalletRepository(db)

    def append_ledger(self, action_type: str, detail: str) -> str:
        from src.core.events import broadcast_event
        last_tx = self.repo.get_latest_transaction()
        prev_hash = last_tx.tx_hash if last_tx else "0" * 64
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Calculate SHA-256 hash chaining parent block
        tx_hash = hashlib.sha256(
            f"{prev_hash}|{action_type}|{detail}|{timestamp}".encode()
        ).hexdigest()

        tx = self.repo.record_transaction(tx_hash, prev_hash, action_type, detail)
        broadcast_event("LEDGER_TRANSACTION", {
            "id": tx.id,
            "hash": tx_hash,
            "prevHash": prev_hash,
            "actionType": action_type,
            "detail": detail,
            "timestamp": timestamp
        })
        return tx_hash

    def list_wallets(self) -> list:
        return self.repo.get_all()

    def create_wallet(self, label: str, address: str | None = None, credits: int = 20) -> dict:
        wallet_addr = address if address else f"0x{secrets.token_hex(20)}"
        wallet = self.repo.create(label.strip(), wallet_addr, credits)
        short_addr = f"{wallet_addr[:6]}...{wallet_addr[-4:]}"
        
        self.append_ledger(
            "WALLET_CREATED",
            f"Created {label} ({short_addr}) with {credits} credits"
        )
        return {
            "success": True,
            "wallet_id": wallet.id,
            "address": wallet.address,
            "credits": wallet.credits,
            "message": f"Wallet '{label}' created successfully!"
        }

    def recharge_credits(self, wallet_id: int, amount: int) -> dict:
        # Atomic pessimistic row lock
        wallet = self.repo.get_by_id_for_update(wallet_id)
        if not wallet:
            raise NotFoundException("Wallet not found.")

        wallet.credits += amount
        self.db.commit()
        self.db.refresh(wallet)

        short_addr = f"{wallet.address[:6]}...{wallet.address[-4:]}"
        self.append_ledger(
            "CREDIT_RECHARGE",
            f"{short_addr} recharged +{amount} credits"
        )

        return {
            "success": True,
            "wallet_id": wallet.id,
            "new_balance": wallet.credits,
            "message": f"Added +{amount} credits to {short_addr}!"
        }
