# Privacy Architecture: DPDP Act (2023) Compliance, Consent Management & Data Retention

## 1. Regulatory Context & Legal Compliance
The Vote Wallet platform is architected in strict conformity with India's **Digital Personal Data Protection (DPDP) Act, 2023**, the **Representation of the People Act, 1951**, and the landmark Supreme Court privacy jurisprudence (*K.S. Puttaswamy v. Union of India*).

Under the DPDP Act:
- **Data Fiduciary**: Election Commission of India (ECI).
- **Data Principal**: The citizen elector.
- **Data Processor**: Secure sovereign cloud infrastructure hosting the Vote Wallet microservices.

---

## 2. Notice & Multilingual Consent (DPDP Sections 5 & 6)

### Consent Collection Flow
Prior to collecting any biometric or demographic data, a clear, standalone, and multilingual Consent Notice is rendered to the citizen:
1. **Plain Language**: Available in English, Hindi, and Regional Languages (Telugu, Tamil, etc.).
2. **Explicit Purpose Specification**: Consent is sought solely for:
   - Verifying voter registration on the electoral roll.
   - Performing real-time facial liveness and biometric authentication.
   - Issuing an anonymous, single-use voting token.
3. **Opt-in Confirmation**: A mandatory interactive consent checkbox must be actively clicked before the device camera or biometric hardware prompt is initialized.

---

## 3. Zero-Knowledge Biometric Architecture & Data Minimization

The platform enforces the principle of **Data Minimization (DPDP Section 6(1))** through rigorous cryptographic techniques:

### Ephemeral Facial Biometrics
1. **Volatile RAM Only**: Captured video frames from the citizen's mobile or webcam are processed strictly in volatile memory.
2. **No Raw Frame Storage**: Raw images are NEVER written to disk, database tables, or persistent object storage.
3. **Template Crypto**: Facial embeddings generated via ArcFace are compared against encrypted templates in memory. Once matched, the embedding vector in RAM is zeroed (`memset`).

### Strict Identity Dissociation
- **Database Isolation**: The `voter_registry` database and `ballot_box` database reside in distinct VPC subnets with segregated credentials.
- **Participation Flag Only**: The voter registry records ONLY that the citizen has voted (`has_voted = true`, timestamp).
- **Zero Identity in Ballots**: The ballot table contains:
  $$\text{Ballot} = \{ \text{ballot\_id}, \text{encrypted\_vote}, \text{tracker\_hash}, \text{merkle\_index} \}$$
  **No column for `voter_id`, `national_id`, `phone_number`, or `ip_address` exists.**

---

## 4. Retention Schedule & Automated Purging

| Data Category | Storage Mechanism | Retention Period | Purging Mechanism |
| :--- | :--- | :--- | :--- |
| **OTP Passcodes** | Redis Key with TTL | **300 Seconds (5 mins)** | Automatic Redis TTL expiration |
| **Voter Session JWTs** | Redis + Client Keystore | **900 Seconds (15 mins)** | Automatic TTL / Invalidation on cast |
| **Biometric Challenges** | Redis Set with TTL | **300 Seconds** | Automatic key expiration |
| **Encrypted Vote Tokens** | PostgreSQL (`vote_tokens`) | **Duration of Election** | Token burned immediately upon use; purged post-audit |
| **Voter Participation** | PostgreSQL (`voter_participation`) | **180 Days** (Statutory election petition limit) | Cryptographic shredding after election dispute window closes |
| **Encrypted Ballots & Ledger** | PostgreSQL (`ballot_box`) + WORM S3 | **Permanent / Historical Record** | Fully anonymous; immutable for historical verification |
| **Audit Log Hash-Chain** | PostgreSQL (`audit_logs`) + S3 Object Lock | **7 Years** | WORM retention lock enforces immutable audit trail |

---

## 5. Data Principal Rights & Grievance Redressal
In accordance with Section 11–13 of the DPDP Act:
- **Right to Information**: Citizens can query the Public Bulletin Board with their anonymous Tracker ID at any time to verify that their ballot was tallied without exposing their candidate selection.
- **Data Protection Officer (DPO)**: Dedicated contact (`dpo@vote.gov.in`) with automated grievance logging and 72-hour statutory response SLAs.
