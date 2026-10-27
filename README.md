# 🗳️ Vote Wallet — Cryptographic Voting & Merkle Audit Ledger

An electronic voting platform prototype and cryptographic audit ledger built with **Node.js, Express, SQLite / PostgreSQL, and Redis Streams**, designed for voter-verifiable ballot inclusion and tamper-evident audit trails.

---

## 📌 What I Built & What I Learned

### What I Built
- **Cryptographic Merkle Audit Tree:** Implemented an RFC 6962-compliant binary Merkle tree engine generating $O(\log N)$ inclusion proofs. This allows voters to mathematically verify that their cast ballot is sealed in the election ledger without disclosing voter identity or ballot selections.
- **Decoupled Ballot Architecture:** Engineered a voting pipeline that decouples citizen identity tokens from cast ballots. Ballots are encrypted using AES-256 and stored with zero voter identifiers, preserving constitutional ballot secrecy while enforcing strict one-token-one-vote rules.
- **Dual-Mode Persistence:** Implemented local zero-config persistence using SQLite for rapid local development, alongside schema support for PostgreSQL and connection pooling.
- **Event-Driven Telemetry:** Designed server-sent events (SSE) and RESTful API endpoints for election authorities to monitor voter turnout and verify audit chain integrity.

### What I Learned
- **Cryptographic Verification vs. Trust:** How binary hash trees and inclusion proofs can establish end-to-end auditability without central database trust.
- **Race Condition Prevention:** The critical importance of atomic token burning (using Redis atomic scripts or transactional database locks) to prevent concurrent double-vote submission.
- **Graceful Degradation:** Structuring distributed service fallbacks so core ingestion and local cryptographic validation remain operational when optional services (like Redis or external databases) are unavailable.

---

## 🌐 Application Architecture & Design

| Component | Target URL | Responsibilities |
| :--- | :--- | :--- |
| **Citizen Voter Web App** | `http://localhost:3000` | Voter authentication, ballot casting, and Merkle receipt proof verification |
| **Election Admin Console** | `http://localhost:3004` | Turnout tracking, candidate roll management, and audit ledger inspection |

### Architectural Highlights
- **Designed for High-Throughput Ingestion:** Architected around Redis Streams (`XADD` / `XREADGROUP`) to decouple peak ballot surges from relational database write bottlenecks.
- **Cryptographic Inclusion Proofs:** Implements domain-separated SHA-256 hashing (`0x00` leaf prefix, `0x01` node prefix) to guard against second-preimage attacks.
- **Container-Ready Architecture:** Includes multi-stage Docker builds, Docker Compose definitions, and Kubernetes deployment manifests with horizontal pod autoscaler (HPA) specifications for distributed deployment.

---

## 🛠️ Tech Stack

- **Runtime & Backend:** Node.js (v20+), Express.js
- **Persistence:** SQLite (default local development), PostgreSQL (via Drizzle ORM / pg)
- **Message Broker & Queue:** Redis Streams (optional, with in-memory fallback)
- **Cryptography:** Node.js `crypto` (SHA-256 Merkle Tree, AES-256-CBC ballot sealing)
- **Testing:** Native Node.js test scripts (`assert`, HTTP integration tests)
- **Infrastructure:** Docker Compose, Kubernetes manifests, Nginx reverse proxy

---

## 📁 Repository Layout

```
vote-genz-wallet/
├── apps/
│   ├── web/               # Express-based voter web portal & core API service
│   ├── admin/             # Electoral administration console
│   └── mobile/            # Mobile companion interface
├── services/
│   ├── redis.js           # Redis Streams client with in-memory fallback
│   ├── merkle.js          # Merkle tree implementation & inclusion proof builder
│   └── sqlite-adapter.js  # Database persistence adapter
├── packages/              # Shared TypeScript definitions and client utilities
├── db/                    # SQL migrations and schema fixtures
├── infra/                 # Docker Compose, Nginx, and Kubernetes manifests
├── test/
│   ├── concurrency-and-merkle.test.js  # Cryptographic throughput & Merkle tests
│   └── e2e-voting-lifecycle.test.js    # End-to-end HTTP integration test
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- (Optional) [Docker](https://www.docker.com/) and Docker Compose (required for Redis and PostgreSQL container orchestration)

### 1. Installation

Clone the repository and install root dependencies:
```bash
git clone https://github.com/Anilkumar4516/vote-genz-wallet.git
cd vote-genz-wallet
npm install
```

### 2. Run Cryptographic & Merkle Tests (Fast & Self-Contained)

Run the standalone cryptographic engine test suite:
```bash
node test/concurrency-and-merkle.test.js
```
This test runs in-memory with zero external dependencies and validates:
- RFC 6962 leaf hashing and Merkle tree root construction.
- Generation and mathematical verification of $O(\log N)$ inclusion proofs across 1,024 and 10,000 ballot batches.
- Immediate rejection of tampered proofs.

### 3. Run the Web Voter Portal Locally

Start the web application with SQLite persistence:
```bash
node apps/web/index.js
```
Once started, access the voter portal at **`http://localhost:3000`**.

> **⚠️ Local Startup Note:** When running `node apps/web/index.js` without a local Redis server running on port `6379`, the service will attempt connection retries for ~15 seconds before successfully falling back to the built-in in-memory queue. Once the console logs `Operating in fallback mode`, the HTTP server is ready.

### 4. Running the Full Stack with Docker Compose

To run the full stack including Redis 7 and PostgreSQL containers:
```bash
docker compose up --build -d
```
To stop the containers:
```bash
docker compose down
```

### 5. Running the End-to-End Test

```bash
npm test
```

> **⚠️ Test Suite Flag / Caveat:**
> - `test/concurrency-and-merkle.test.js` passes 100% independently.
> - `test/e2e-voting-lifecycle.test.js` launches a child process to test the HTTP API. If Redis is not running locally, the 15-second Redis retry loop exceeds the test runner's initial 4-second health-check wait, resulting in an `ERR_ASSERTION: Server did not come online`. For the E2E test to pass cleanly, either start Redis locally or adjust the test timeout to allow the fallback to engage.

---

## 📡 Key API Endpoints

- `GET /api/health` — Service readiness probe
- `POST /api/auth/login` — Voter authentication & OTP dispatch
- `POST /api/auth/verify-otp` — Session token exchange
- `POST /api/vote/cast` — Decoupled ballot ingestion & token burn
- `GET /api/vote/merkle-proof/:receiptHash` — Inclusion proof retrieval for ballot verification
- `GET /api/vote/receipt/:code` — Zero-knowledge receipt status check
- `GET /api/election/live-stats` — Aggregated turnout telemetry
- `POST /api/admin/reset-election` — Test fixture state reset

---

## 📄 License

This project is licensed under the ISC License.
