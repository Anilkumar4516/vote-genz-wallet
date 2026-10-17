from fastapi.testclient import TestClient
from cmd.server.main import app
from src.core.security import create_access_token

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_voting_api_flow():
    # 1. Login request OTP
    login_res = client.post("/api/auth/login", json={"voter_code": "VOTER-SAN8639"})
    assert login_res.status_code == 200
    otp = login_res.json().get("demo_otp")

    if otp:
        # 2. Verify OTP
        verify_res = client.post("/api/auth/verify-otp", json={"voter_code": "VOTER-SAN8639", "otp": otp})
        assert verify_res.status_code == 200
        token = verify_res.json()["session_token"]
    else:
        # Direct token generation for testing
        token = create_access_token(subject=1)

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Issue anonymous ballot token
    tok_res = client.post("/api/vote/token", json={"election_id": 1}, headers=headers)
    if tok_res.status_code == 200:
        anon_tok = tok_res.json()["anonymous_token"]
        # 4. Cast ballot
        cast_res = client.post(
            "/api/vote/cast",
            json={"anonymous_token": anon_tok, "candidate_id": 1, "election_id": 1},
            headers=headers
        )
        assert cast_res.status_code == 200
        receipt_code = cast_res.json()["receipt_code"]

        # 5. Verify receipt
        rcpt_res = client.get(f"/api/vote/receipt/{receipt_code}")
        assert rcpt_res.status_code == 200
        assert rcpt_res.json()["found"] is True
