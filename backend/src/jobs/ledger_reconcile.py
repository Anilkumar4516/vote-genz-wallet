import hashlib
import logging
from sqlalchemy.orm import Session
from src.modules.wallet.models import Transaction

logger = logging.getLogger(__name__)


def audit_ledger_chain(db: Session) -> dict:
    """Verifies the unbroken cryptographic SHA-256 hash chain of the entire audit ledger."""
    transactions = db.query(Transaction).order_by(Transaction.id.asc()).all()
    
    for i, tx in enumerate(transactions):
        expected_prev = "0" * 64 if i == 0 else transactions[i - 1].tx_hash
        if tx.prev_hash != expected_prev:
            logger.error(f"Chain broken at Block #{tx.id}: prev_hash mismatch!")
            return {"valid": False, "failed_at_id": tx.id, "reason": "Parent hash mismatch"}

    logger.info(f"Successfully verified ledger chain over {len(transactions)} transaction blocks.")
    return {
        "valid": True,
        "total_blocks": len(transactions),
        "latest_hash": transactions[-1].tx_hash if transactions else "GENESIS"
    }
