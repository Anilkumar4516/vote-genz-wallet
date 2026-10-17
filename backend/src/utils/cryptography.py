import hashlib

LEAF_PREFIX = b"\x00"
NODE_PREFIX = b"\x01"


def sha256_hex(data: bytes | str) -> str:
    """Computes standard SHA-256 hash in hexadecimal format."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def hash_leaf(receipt_hash: str, candidate_id: int | str, timestamp: str) -> str:
    """RFC 6962 Domain-separated leaf hash calculation."""
    content = f"{receipt_hash}|{candidate_id}|{timestamp}".encode("utf-8")
    return hashlib.sha256(LEAF_PREFIX + content).hexdigest()


def hash_node(left_hex: str, right_hex: str) -> str:
    """RFC 6962 Domain-separated intermediate node hash."""
    left_bytes = bytes.fromhex(left_hex)
    right_bytes = bytes.fromhex(right_hex)
    return hashlib.sha256(NODE_PREFIX + left_bytes + right_bytes).hexdigest()


class MerkleTree:
    """RFC 6962 Compliant Merkle Tree with O(log N) inclusion proofs."""

    def __init__(self, leaf_hashes: list[str] | None = None):
        self.leaves = list(leaf_hashes) if leaf_hashes else []
        self.layers: list[list[str]] = []
        self._build_tree()

    def _build_tree(self):
        if not self.leaves:
            self.layers = [["0" * 64]]
            return

        current = list(self.leaves)
        self.layers = [current]

        while len(current) > 1:
            next_layer = []
            for i in range(0, len(current), 2):
                left = current[i]
                right = current[i + 1] if i + 1 < len(current) else left
                next_layer.append(hash_node(left, right))
            self.layers.append(next_layer)
            current = next_layer

    def get_root(self) -> str:
        return self.layers[-1][0] if self.layers and self.layers[-1] else "0" * 64

    def get_proof(self, leaf_index: int) -> list[dict[str, str]]:
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise IndexError(f"Leaf index {leaf_index} out of bounds")

        proof = []
        idx = leaf_index

        for layer in self.layers[:-1]:
            is_right = (idx % 2 == 1)
            sibling_idx = idx - 1 if is_right else idx + 1

            if sibling_idx < len(layer):
                proof.append({
                    "position": "left" if is_right else "right",
                    "hash": layer[sibling_idx]
                })
            else:
                proof.append({
                    "position": "right",
                    "hash": layer[idx]
                })
            idx //= 2

        return proof

    @staticmethod
    def verify_proof(leaf_hash: str, proof: list[dict[str, str]], root_hash: str) -> bool:
        current = leaf_hash
        for step in proof:
            if step["position"] == "left":
                current = hash_node(step["hash"], current)
            else:
                current = hash_node(current, step["hash"])
        return current.lower() == root_hash.lower()
