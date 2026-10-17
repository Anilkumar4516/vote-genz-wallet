import time
import json
import logging
from src.core.config import get_settings
from src.core.database import SessionLocal
from src.core.redis import get_redis_client
from src.utils.cryptography import MerkleTree
from src.modules.voting.models import Candidate, Ballot

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")
logger = logging.getLogger("worker")
settings = get_settings()


def run_worker():
    logger.info("🚀 Starting Asynchronous Ballot Ingestion Worker...")
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

                    for msg_id, data in messages:
                        ack_ids.append(msg_id)
                        payload_str = data.get("payload")
                        if not payload_str:
                            continue
                        try:
                            # Evaluate or parse payload
                            payload = eval(payload_str) if isinstance(payload_str, str) and payload_str.startswith("{") else json.loads(payload_str)
                            leaf_hashes.append(payload.get("leaf_hash", "0" * 64))
                        except Exception as parse_err:
                            logger.error(f"Failed parsing message payload: {parse_err}")

                    if leaf_hashes:
                        tree = MerkleTree(leaf_hashes)
                        root = tree.get_root()
                        logger.info(f"⚡ Sealed Merkle batch of {len(leaf_hashes)} ballots! Batch Root: {root[:16]}...")

                    if ack_ids:
                        client.xack(stream_key, group_name, *ack_ids)
            finally:
                db.close()

        except Exception as err:
            logger.error(f"Worker iteration error: {err}")
            time.sleep(2)


if __name__ == "__main__":
    run_worker()
