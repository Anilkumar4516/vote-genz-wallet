# 🏛️ Vote Wallet (Production-Grade & 1M-User Scalable)

A bank-grade, high-throughput voting platform and cryptographic Merkle audit ledger built with **Node.js, Express, PostgreSQL 16 (Drizzle ORM), Redis Streams, and Kubernetes**, engineered to handle **1,000,000+ registered citizens**.

---

## 🌐 Live Application Portals & Local Access

| Application Portal | Local URL | Target Audience & Features |
| :--- | :--- | :--- |
| **Citizen Voter Web Portal** | [http://localhost:3000](http://localhost:3000/) | Secure citizen voter portal with biometric verification, OTP authentication, anonymous encrypted ballot casting, and Merkle inclusion proof receipt checking |
| **Election Commission Admin Console** | [http://localhost:3004](http://localhost:3004/) | Mission-control administrative console for election officials: real-time turnout count, voter roll enrollment, candidate management, key ceremony approvals, and audit ledger inspection |

---

## ✨ Production Architectural Highlights

- **⚡ High-Throughput Asynchronous Vote Ingestion:** Powered by **Redis Streams** (`XADD` / `XREADGROUP`), decoupling incoming ballot surges ($1,000+\text{ TPS}$) from database writes with atomic token burn.
- **🛡️ Cryptographic Merkle Tree Audit Ledger:** Implements RFC 6962 domain-separated hashing and compact $O(\log N)$ inclusion proofs, allowing voters to mathematically verify their ballot is sealed in the ballot box without scanning millions of records.
- **🔒 Zero-Knowledge Ballot Box:** Voter identities are strictly decoupled from ballots. AES-256 encrypted ballots contain zero voter identifiers, enforcing strict ballot secrecy.
- **🗄️ Relational Persistence & Connection Pooling:** Dual-mode persistence supporting **PostgreSQL 16** via **Drizzle ORM** with PgBouncer connection pooling and fallback local SQLite.
- **🐳 Enterprise Containerization & Orchestration:** Multi-stage minimal Docker builds, full stack Docker Compose (PostgreSQL, Redis, API, Worker), and production Kubernetes manifests with Horizontal Pod Autoscaling (HPA) and PodDisruptionBudgets.
- **🚦 Distributed Rate Limiting & Health Checks:** Redis-backed sliding-window rate limiters protecting authentication and voting endpoints, with `/api/health` readiness probes.

---

## 🛠️ Production Tech Stack

- **Monorepo Management:** Turborepo & pnpm Workspaces
- **Frontend Applications (`apps/`):** Web Voter Portal, Admin Dashboard, Mobile App
- **Backend Microservices (`services/`):** Auth, Voting & Ballot Ingestion, Admin, Face Verification
- **Shared Libraries (`packages/`):** Type-Safe SDKs, Domain Types, Merkle Audit Client
- **Primary Databases (`db/`):** Dual PostgreSQL 16 (Identity Database & Ballot Box Ledger)
- **Message Broker & Cache:** Redis 7 (Redis Streams + Atomic Lua Scripts)
- **Cryptographic Verification:** SHA-256 Merkle Trees (RFC 6962) & AES-256-CBC Ballot Sealing
- **Infrastructure & Orchestration (`infra/`):** Docker Compose, Nginx Reverse Proxy, Kubernetes (HPA), Prometheus & Grafana
- **Testing (`tests/`):** E2E (Playwright), Load Testing (k6), Security & Tamper Detection
- **CI/CD:** GitHub Actions Matrix Pipelines

---

## 📁 Monorepo Architecture & Directory Layout

```
vote-wallet/
├── apps/                  FRONTEND (web voter app, admin dashboard, mobile)
│   ├── web/               # Citizen voting web application
│   ├── admin/             # Electoral commission administrative dashboard
│   └── mobile/            # Mobile voter companion app
├── services/              BACKEND (auth, voting, admin, face)
│   ├── auth/              # Citizen identity, WebAuthn, biometric authentication
│   ├── voting/            # Asynchronous ballot ingestion, zero-knowledge ballot box, Merkle tree
│   ├── admin/             # Election configuration, candidate management, roll verification
│   └── face/              # Facial verification & liveness detection service
├── packages/              Shared code (types, API client, audit client, configs)
│   ├── types/             # Shared TypeScript domain models & DTOs
│   ├── api-client/        # Type-safe API SDK for apps
│   ├── audit-client/      # Merkle inclusion proof & cryptographic audit verification client
│   └── config/            # Shared ESLint, Prettier, and TypeScript configurations
├── db/                    SQL migrations for the two databases
│   ├── migrations/        # Dual database SQL migrations (Identity DB & Ballot DB)
│   └── seeds/             # Seed fixtures for local development
├── infra/                 Docker, Nginx, Kubernetes, monitoring
│   ├── docker/            # Multi-stage Dockerfiles and container configurations
│   ├── nginx/             # Gateway routing and reverse proxy
│   ├── k8s/               # Production Kubernetes manifests, HPA, and ingress
│   └── monitoring/        # Prometheus metrics and Grafana dashboards
├── tests/                 End-to-end, load and security tests
│   ├── e2e/               # Playwright cross-browser voting flow tests
│   ├── load/              # k6 spike and high-concurrency ballot ingestion tests
│   └── security/          # Ballot integrity, replay prevention, and penetration tests
├── docs/                  Architecture, API spec, runbooks
│   ├── architecture/      # System architecture and cryptographic Merkle specifications
│   ├── api/               # OpenAPI / Swagger specifications for all services
│   └── runbooks/          # Election day operations, disaster recovery, and scaling runbooks
├── .github/workflows/     CI/CD
│   └── ci.yml             # Monorepo build, lint, test, and container scanning pipeline
├── docker-compose.yml     Local development
├── package.json           Workspace root (pnpm workspaces)
├── pnpm-workspace.yaml    # pnpm workspace definition
├── turbo.json             # Turborepo task pipeline & caching definition
├── .env.example           # Root environment configuration template
└── README.md              # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Workspace Prerequisites
Ensure [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/) are installed:
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### 2. Install Workspace Dependencies
Install dependencies across all workspaces (`apps/*`, `services/*`, `packages/*`):
```bash
pnpm install
```

### 3. Run Development Servers & Access Portals
Launch applications and services locally:
```bash
# Option A: Launch Web Voter App & Backend API (Port 3000)
npm run dev

# Option B: Launch Admin Dashboard (Port 3004)
npm run dev:admin

# Option C: Launch everything with Turborepo
pnpm run dev
```

Once running, access the portals in your browser:
- 🗳️ **Citizen Voter Web Portal:** [http://localhost:3000](http://localhost:3000/)
- 🏛️ **Election Commission Admin Console:** [http://localhost:3004](http://localhost:3004/)

### 4. Full Production Stack with Docker Compose
To launch the complete enterprise architecture (PostgreSQL dual databases, Redis 7, Nginx Gateway, and Microservices):
```bash
# Start all containers in background
docker compose up --build -d

# View real-time logs across services
docker compose logs -f

# Stop containers
docker compose down
```

### 5. Run Test Suite Across Workspaces
Execute unit, integration, and cryptographic Merkle verification tests across all packages:
```bash
pnpm test
```

---

## 🔍 Cryptographic Verification & Service Endpoints

- **Gateway Health Probe:** `GET /api/health`
- **Prometheus Metrics:** `GET /metrics`
- **Real-Time Live SSE Stream:** `GET /api/election/stream` (0ms push for `BALLOT_SEALED`, `MERKLE_ROOT_SEALED`, `LIVE_STATS_REFRESH`)
- **Duplex WebSocket Stream:** `WS /ws/election` (Real-time live telemetry stream)
- **Real-Time Turnout & Leaderboard:** `GET /api/election/live-stats`
- **Auth Service:** `POST /api/auth/login`, `POST /api/auth/verify-otp`, `GET /api/auth/webauthn-challenge`
- **Voting Ballot Ingestion:** `POST /api/vote/cast` (Redis Streams `XADD` with atomic token burn)
- **Merkle Inclusion Proof:** `GET /api/vote/merkle-proof/:receiptHash` ($O(\log N)$ verification)
- **Public Receipt Verification:** `GET /api/vote/receipt/:code` (Zero-knowledge confirmation)
- **Audit Hash Chain Integrity:** `GET /api/audit/verify-chain` (Full SHA-256 chain verification)
- **Biometric Challenge Audit:** `GET /api/audit/biometrics` (Biometric challenge logs)
- **Admin Election Controls:** `POST /api/admin/elections/:id/close`, `POST /api/admin/elections/:id/reopen`, `POST /api/admin/elections/:id/tally`, `POST /api/admin/reset-election`

