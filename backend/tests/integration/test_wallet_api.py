from fastapi.testclient import TestClient
from cmd.server.main import app

client = TestClient(app)


def test_wallet_api_endpoints():
    # 1. Fetch Wallets
    res = client.get("/api/wallets")
    assert res.status_code == 200
    wallets = res.json()["wallets"]
    assert len(wallets) > 0

    target_wallet_id = wallets[0]["id"]
    initial_credits = wallets[0]["credits"]

    # 2. Recharge credits
    recharge_res = client.post(
        "/api/wallet/recharge",
        json={"wallet_id": target_wallet_id, "amount": 15}
    )
    assert recharge_res.status_code == 200
    assert recharge_res.json()["new_balance"] == initial_credits + 15

    # 3. Fetch Poll Dashboard
    poll_res = client.get(f"/api/poll?walletId={target_wallet_id}")
    assert poll_res.status_code == 200
    poll_data = poll_res.json()
    assert "candidates" in poll_data
    assert "activeWallet" in poll_data
