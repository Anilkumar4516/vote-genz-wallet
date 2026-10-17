# Runbook: Election Day Operational Procedures

## Pre-Election Checklist (T - 24 Hours)
1. **Infrastructure Health Probe**:
   - Check Kubernetes pods: `kubectl get pods -n vote-wallet`
   - Verify Redis replication and memory: `redis-cli info replication`
   - Verify dual database connectivity:
     - Voter Registry: `psql -h voter-registry-db -c "SELECT COUNT(*) FROM voters;"`
     - Ballot Box: `psql -h ballot-box-db -c "SELECT COUNT(*) FROM ballots;"` (MUST BE 0)
2. **Key Ceremony Verification**:
   - Confirm that Election Master Key pair was generated and split into 3 Shamir shares.
   - Confirm that the Election Public Key is published in the Ballot Box database.
3. **SMS & Network Provider Readiness**:
   - Ensure rate limit ceilings are raised with telecommunications providers for OTP dispatch.

---

## Poll Opening (T = 07:00 IST)
1. Authorized Election Commissioner logs in to Admin Portal at `https://admin.vote.gov.in`.
2. Navigate to **Elections** ➔ Select Active Election ➔ Click **"Open Election"**.
3. System verifies zero initial ballots and transitions status to `OPEN`.
4. Citizen portals (`apps/web` and `apps/mobile`) enable the ballot casting flow.
5. Monitor real-time turnout metrics on Grafana dashboard `Election Day Operations`.

---

## Continuous Monitoring During Poll Hours
- **Turnout Rate**: Track live voter participations count (identity roll only).
- **Latency Alarms**: If P95 latency exceeds 300ms, Horizontal Pod Autoscaler will trigger replica scaling from 5 to 30 pods.
- **DDoS / Rate Limit Violations**: Inspect Nginx 429 metrics; block offensive IP CIDRs at cloud WAF / Cloudflare edge if necessary.

---

## Poll Closing & Cryptographic Tally (T = 18:00 IST)
1. At 18:00 IST, click **"Close Election"** in the Admin Console.
2. The system stops accepting new vote token requests.
3. **5-Minute Drain Window**: In-flight token holders are allowed 300 seconds to cast already-issued ballots.
4. **Mathematical Balance Proof**:
   - Verify that the total number of participations in Registry DB strictly matches the total number of ballots in Ballot Box DB:
     $$N_{\text{ballots}} \equiv N_{\text{participations}}$$
5. **Key Assembly & Decryption**:
   - Convene 2 of the 3 Election Trustees to submit their Shamir key shares.
   - System reconstructs the election private key in memory.
   - Decrypts and tallies ballots.
   - Generates and signs the final Public Bulletin Board report.
