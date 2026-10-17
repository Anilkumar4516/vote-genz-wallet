# Vote Wallet: Operational Runbooks

## 1. Election Day Operational Procedures

### Pre-Election Key Ceremony (T - 24 Hours)
1. Concurrently assemble 3 authorized Election Trustees (Chief Election Commissioner, Supreme Court Observer, Technical Auditor).
2. Execute the Shamir Secret Sharing ceremony in the Admin Console at `/key-ceremony`.
3. Verify public key generation and test encrypt/decrypt cycle.
4. Distribute the 3 key shares onto encrypted hardware HSM tokens.

### Opening the Polls (T - 00:00)
1. Verify database synchronization and zero initial ballots in the ballot box:
   ```bash
   psql -d ballot_box -c "SELECT COUNT(*) FROM ballots;" # MUST BE 0
   ```
2. In Admin Portal (`/elections/[id]`), click **"Open Election"**.
3. Verify Prometheus health metrics for all upstream services (`:3001`, `:3002`, `:3003`, `:8000`).

### Closing the Polls & Tally Ceremony (T + Polls Close)
1. Transition election status to `CLOSED`. No further ballot tokens will be issued.
2. Allow ongoing inflight votes to complete within a 5-minute grace window.
3. Re-assemble 2 of the 3 Trustees to submit threshold private key shares.
4. Execute mathematical tallying:
   - Prove balance: $N_{\text{ballots}} \equiv N_{\text{participations}}$.
   - Verify Merkle tree consistency from leaf 0 to $N-1$.
   - Publish final results and cryptographic Bulletin Board export for public inspection.

---

## 2. Emergency Incident Response

### High Memory / High Concurrency Surge
1. Scale up Kubernetes pods:
   ```bash
   kubectl scale deployment voting-service --replicas=20 -n vote-wallet
   ```
2. Enable Redis read replica pooling in `voting-service/src/config/database.config.ts`.

### Suspected Database Tampering
1. Trigger automatic hash-chain verification:
   ```bash
   curl -X POST https://admin.vote.gov.in/api/admin/audit/verify
   ```
2. If chain breakage is detected, the compromised block hash and timestamp are isolated immediately.
