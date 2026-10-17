import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.database import Base
from src.modules.wallet.services import WalletService
from src.modules.wallet.models import Wallet


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_wallet_creation_and_recharge(db_session):
    service = WalletService(db_session)
    res = service.create_wallet("Test Wallet", credits=25)
    assert res["success"] is True
    assert res["credits"] == 25

    wallet_id = res["wallet_id"]
    recharge_res = service.recharge_credits(wallet_id, amount=10)
    assert recharge_res["success"] is True
    assert recharge_res["new_balance"] == 35

    # Check hash-chained ledger transaction was appended
    latest_tx = service.repo.get_latest_transaction()
    assert latest_tx is not None
    assert latest_tx.action_type == "CREDIT_RECHARGE"
