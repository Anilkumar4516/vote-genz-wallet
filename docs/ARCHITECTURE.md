# Vote Wallet: Architectural Specification & Cryptographic Design

## 1. System Overview
Vote Wallet is a state-of-the-art, secure, end-to-end verifiable digital electoral voting platform built for national-scale elections. It resolves the classic tension between **elector authentication** (knowing exactly who is voting) and **ballot secrecy** (preventing anyone from knowing how they voted).

---

## 2. Zero-Knowledge Cryptographic Decoupling
To mathematically guarantee coercion-free secret ballots:
1. **Two Physically Separated Databases**:
   - **Database 1: Voter Identity Registry**: Houses citizen names, EPIC numbers, hashed credentials, and participation records (`voter_participation`).
   - **Database 2: Ballot Box Ledger**: Houses encrypted ballots, vote tokens, and Merkle tree leaves. **NO voter ID column exists in this database.**
2. **Atomic Single-Use Token Exchange**:
   - When a citizen authenticates via 2FA and facial/fingerprint biometrics, the system issues a cryptographically random, anonymous single-use vote token.
   - The token is decoupled from the citizen's personal record.
   - When the ballot is cast, the vote token is burned atomically.
3. **Receipt-Freeness & Coercion Resistance**:
   - Citizens receive a Tracker Hash confirming inclusion in the Merkle Tree.
   - The receipt proves that *a* vote was counted, but reveals *zero information* about which candidate was selected.

---

## 3. High-Throughput Merkle Audit Ledger
- **Algorithm**: $O(\log N)$ binary SHA-256 Merkle Tree.
- **Complexity**: For an election with 1,000,000 ballots, a proof of inclusion requires only $\log_2(1,000,000) \approx 20$ hashes ($\approx 640$ bytes).
- **Public Bulletin Board**: Anyone can verify that the root hash published by the election commission accurately incorporates all cast ballots without tampering.

---

## 4. Threshold Cryptography & 2-of-3 Shamir Key Ceremony
- Ballots are encrypted under an election public key generated prior to poll opening.
- The corresponding private key is split across 3 independent Trustees (Election Commission, Judiciary, Independent Auditor) using Shamir's Secret Sharing scheme with threshold $k = 2$.
- Decryption is mathematically impossible until at least 2 Trustees submit their hardware key shares following official poll close.
