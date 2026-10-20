import time
import json
import logging
import hashlib
from datetime import datetime, timezone
from src.core.config import get_settings
from src.core.database import SessionLocal
from src.core.redis import get_redis_client, publish_election_event
from src.utils.cryptography import MerkleTree
from src.modules.voting.models import Candidate, Ballot, VoterParticipation
from src.modules.wallet.models import Transaction

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")
logger = logging.getLogger("worker")
settings = get_settings()


def run_worker():
    logger.info("🚀 Starting Asynchronous High-Throughput Ballot Ingestion Worker...")
    client = get_redis_client()
    if not client:
        logger.warning("Redis is offline. Worker entering idle polling loop...")
        while True:
            time.sleep(5)
            client = get_redis_client()
            if client:
                break

    stream_key = settings.REDIS_STREAM_KEY
    group_name = settings.REDIS_CONSUMER_GROUP

    try:
        client.xgroup_create(stream_key, group_name, id="0", mkstream=True)
    except Exception as e:
        if "BUSYGROUP" not in str(e):
            logger.warning(f"Consumer group notice: {e}")

    logger.info(f"Worker listening on stream '{stream_key}' [Group: {group_name}]")

    while True:
        try:
            entries = client.xreadgroup(
                groupname=group_name,
                consumername="worker-1",
                streams={stream_key: ">"},
                count=100,
                block=2000
            )

            if not entries:
                continue

            db = SessionLocal()
            try:
                for stream, messages in entries:
                    leaf_hashes = []
                    ack_ids = []
                    committed_ballots = 0

                    for msg_id, data in messages:
                        ack_ids.append(msg_id)
                        payload_str = data.get("payload")
                        if not payload_str:
                            continue
                        try:
                            if isinstance(payload_str, str):
                                payload = json.loads(payload_str.replace("'", '"')) if not payload_str.startswith("{") else json.loads(payload_str)
                            else:
                                payload = payload_str

                            receipt_hash = payload.get("receipt_hash")
                            candidate_id = payload.get("candidate_id")
                            voter_id = payload.get("voter_id")
                            election_id = payload.get("election_id", 1)
                            created_hour = payload.get("created_hour", "")
                            encrypted_choice = payload.get("encrypted_choice", "")
                            leaf_hash = payload.get("leaf_hash", "0" * 64)

                            leaf_hashes.append(leaf_hash)

                            # Idempotent persistence check: If not already saved, insert ballot and participation
                            existing = db.query(Ballot).filter(Ballot.receipt_hash == receipt_hash).first()
                            if not existing and receipt_hash:
                                ballot = Ballot(
                                    election_id=election_id,
                                    candidate_choice_encrypted=encrypted_choice,
                                    receipt_hash=receipt_hash,
                                    created_hour=created_hour,
                                    merkle_leaf_hash=leaf_hash
                                )
                                db.add(ballot)

                                if voter_id:
                                    part = db.query(VoterParticipation).filter(
                                        VoterParticipation.voter_id == voter_id,
                                        VoterParticipation.election_id == election_id
                                    ).first()
                                    if not part:
                                        db.add(VoterParticipation(voter_id=voter_id, election_id=election_id))

                                if candidate_id:
                                    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
                                    if cand:
                                        cand.votes += 1

                                committed_ballots += 1

                        except Exception as parse_err:
                            logger.error(f"Failed parsing message payload: {parse_err}")

                    # Seal Merkle tree batch
                    if leaf_hashes:
                        tree = MerkleTree(leaf_hashes)
                        root = tree.get_root()

                        # Append Merkle root block to hash-chained ledger
                        latest_tx = db.query(Transaction).order_by(Transaction.id.desc()).first()
                        prev_hash = latest_tx.tx_hash if latest_tx else "0" * 64
                        now = datetime.now(timezone.utc)
                        now_iso = now.strftime("%Y-%m-%dT%H:%M:%SZ")
                        detail = f"Sealed Merkle root {root[:16]}... covering {len(leaf_hashes)} ballots (Batch Size: {len(leaf_hashes)})"
                        tx_hash = hashlib.sha256(f"{prev_hash}|MERKLE_ROOT_SEALED|{detail}|{now_iso}".encode("utf-8")).hexdigest()

                        tx = Transaction(
                            tx_hash=tx_hash,
                            prev_hash=prev_hash,
                            action_type="MERKLE_ROOT_SEALED",
                            detail=detail,
                            created_at=now
                        )
                        db.add(tx)
                        db.commit()

                        logger.info(f"⚡ Sealed Merkle batch of {len(leaf_hashes)} ballots! Batch Root: {root[:16]}...")

                        # Broadcast live events via Redis Pub/Sub
                        publish_election_event("MERKLE_ROOT_SEALED", {
                            "merkleRoot": root,
                            "batchSize": len(leaf_hashes),
                            "timestamp": now_iso
                        })
                        publish_election_event("LIVE_STATS_REFRESH", {
                            "newBallotsCount": committed_ballots
                        })

                    # Acknowledge messages
                    if ack_ids:
                        client.xack(stream_key, group_name, *ack_ids)
            finally:
                db.close()

        except Exception as err:
            logger.error(f"Worker iteration error: {err}")
            time.sleep(2)


if __name__ == "__main__":
    run_worker()
