from fastapi.testclient import TestClient
from cmd.server.main import app
from src.core.security import create_access_token

client = TestClient(app)


def test_live_stats_endpoint():
    res = client.get("/api/election/live-stats")
    assert res.status_code == 200
    data = res.json()
    assert "totalVoters" in data
    assert "votesCast" in data
    assert "candidates" in data
    assert "ledgerFeed" in data
    assert len(data["candidates"]) > 0


def test_metrics_endpoint():
    res = client.get("/metrics")
    assert res.status_code == 200
    assert "vote_wallet_ballots_total" in res.text
    assert "vote_wallet_voters_registered" in res.text


def test_admin_election_lifecycle():
    # 1. Reset election
    reset_res = client.post("/api/admin/reset-election")
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True

    # 2. Check live stats after reset
    stats_res = client.get("/api/election/live-stats")
    assert stats_res.json()["votesCast"] == 0

    # 3. Cast a ballot
    token = create_access_token(subject=1)
    headers = {"Authorization": f"Bearer {token}"}
    tok_res = client.post("/api/vote/token", json={"election_id": 1}, headers=headers)
    assert tok_res.status_code == 200
    anon_tok = tok_res.json()["anonymous_token"]

    cast_res = client.post(
        "/api/vote/cast",
        json={"anonymous_token": anon_tok, "candidate_id": 1, "election_id": 1},
        headers=headers
    )
    assert cast_res.status_code == 200

    # 4. Verify live stats reflects the vote
    stats_after_vote = client.get("/api/election/live-stats")
    assert stats_after_vote.json()["votesCast"] == 1

    # 5. Close election
    close_res = client.post("/api/admin/elections/1/close")
    assert close_res.status_code == 200
    assert close_res.json()["success"] is True

    # 6. Cryptographic Tally
    tally_res = client.post("/api/admin/elections/1/tally")
    assert tally_res.status_code == 200
    tally_data = tally_res.json()
    assert tally_data["success"] is True
    assert tally_data["total_ballots"] == 1
    assert tally_data["audit_check_passed"] is True
    assert "Sandeep" in tally_data["tally_breakdown"]

    # 7. Audit hash chain verification
    chain_res = client.get("/api/audit/verify-chain")
    assert chain_res.status_code == 200
    chain_data = chain_res.json()
    assert chain_data["valid"] is True
    assert chain_data["total_blocks"] > 0

    # 8. Reopen election
    reopen_res = client.post("/api/admin/elections/1/reopen")
    assert reopen_res.status_code == 200
    assert reopen_res.json()["success"] is True


def test_websocket_realtime_stream():
    with client.websocket_connect("/ws/election") as ws:
        msg = ws.receive_json()
        assert msg["type"] == "CONNECTED"
        ws.send_text("ping")
        assert ws.receive_text() == "pong"
