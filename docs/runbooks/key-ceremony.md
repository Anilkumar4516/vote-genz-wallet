# Runbook: 2-of-3 Shamir Key Ceremony

## Overview
The Vote Wallet platform guarantees that no single entity (including system administrators, election commissioners, or foreign adversaries) can decrypt ongoing ballots prior to official poll closure.

This guarantee is enforced via **Shamir's $(k, n)$ Threshold Secret Sharing**:
- **Total Shares ($n$)**: 3
- **Threshold Required ($k$)**: 2

---

## The Three Election Trustees
1. **Trustee 1**: Chief Election Commissioner (CEC)
2. **Trustee 2**: Supreme Court Judicial Observer
3. **Trustee 3**: Lead Technical Security Auditor

---

## Phase 1: Pre-Election Key Generation (T - 24h)
1. **Air-Gapped Ceremony Room Setup**:
   - Clean room without recording devices or external wireless transceivers.
2. **Master Key Pair Generation**:
   - Master RSA-4096 / Ed25519 key pair is generated in hardware enclave.
   - Public key is extracted and committed to the Ballot Box database for ballot encryption.
3. **Shamir Polynomial Splitting**:
   - The master private key $S$ is split using a random degree-1 polynomial:
     $$f(x) = S + a_1 x \pmod p$$
   - Share 1: $(1, f(1))$ ➔ Stored on encrypted FIPS 140-3 USB Token A (CEC).
   - Share 2: $(2, f(2))$ ➔ Stored on encrypted FIPS 140-3 USB Token B (Judicial Observer).
   - Share 3: $(3, f(3))$ ➔ Stored on encrypted FIPS 140-3 USB Token C (Lead Auditor).
4. **Master Private Key Destruction**:
   - The raw master private key is securely overwritten with zeros and purged from RAM.
   - All 3 Trustees sign the Key Ceremony Attestation Document.

---

## Phase 2: Post-Election Tally Assembly (T + Close)
1. After the election status transitions to `CLOSED` and the participation balance proof passes ($N_{\text{ballots}} \equiv N_{\text{participations}}$):
2. Navigate to `/key-ceremony` in the Admin Console.
3. At least 2 Trustees insert their hardware tokens and enter their PINs.
4. Using Lagrange interpolation, the system temporarily reconstructs $S$ in isolated memory:
   $$S = f(0) = \sum_{j=1}^{k} y_j \prod_{m \neq j} \frac{x_m}{x_m - x_j}$$
5. Ballots are decrypted, aggregated into candidate totals, and verified against the Merkle tree root.
6. The reconstructed key in memory is immediately cleared (`memset_s`) upon tally completion.
