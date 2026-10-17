# Runbook: Emergency Incident Response

## Severity 1: Suspected Audit Log Tampering

### Detection
The automated integrity scanner alerts that an audit log row does not match its expected SHA-256 hash or prevHash link:
```
[SECURITY ALERT] Hash chain broken at Block Index #412!
```

### Action Steps
1. **Immediate Lockdown**:
   - Prevent any administrative edits or election status transitions.
2. **Retrieve Immutable WORM Backup**:
   - Compare database audit log table with AWS S3 Object Lock bucket (`vote-wallet-production-audit-vault`):
     ```bash
     aws s3 cp s3://vote-wallet-production-audit-vault/audit_blocks_412.json ./
     ```
3. **Forensic Identification**:
   - Identify which column was altered (timestamp, actor, or payload) and trace database audit logs (`pg_stat_statements` / AWS CloudTrail) for the offending IP and database role.
4. **Publish Public Discrepancy Notice**:
   - Post cryptographic notice on the public bulletin board.

---

## Severity 1: Distributed Denial of Service (DDoS)

### Detection
Nginx or ingress controller reports HTTP 502/504 errors or upstream latency exceeding 2,000ms.

### Action Steps
1. **Activate Cloudflare Under Attack Mode**:
   - Force JavaScript challenge or CAPTCHA at the edge for non-mobile traffic.
2. **Tighten Nginx Rate Limiting**:
   - In `infra/nginx/conf.d/rate-limiting.conf`, lower burst limits from 30 to 10.
3. **Emergency Pod Autoscaling**:
   - Override HPA minReplicas:
     ```bash
     kubectl scale deployment voting-service --replicas=30 -n vote-wallet
     kubectl scale deployment auth-service --replicas=20 -n vote-wallet
     ```

---

## Severity 2: Redis Cluster Failover

### Detection
Redis primary node becomes unresponsive; `ioredis` raises connection timeouts.

### Action Steps
1. AWS ElastiCache automatic failover promotes the secondary read replica within 15-30 seconds.
2. If manual intervention is needed:
   ```bash
   aws elasticache failover-replication-group --replication-group-id vote-wallet-redis
   ```
3. Applications gracefully fall back to local in-memory session caching during the failover transition.
