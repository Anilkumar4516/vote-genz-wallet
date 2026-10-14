# vote-genz-wallet

A secure, interactive voting wallet and cryptographic audit ledger application built with Node.js, Express, and SQLite.

---

## ✨ Features

- **💼 Multi-Wallet Management:** Switch between active voter wallets with pre-allocated or custom credit balances.
- **⚡ Voting Credits & Recharge:** Cast votes using credits and instantly top-up balances when needed.
- **📊 Real-time Candidate Polls:** Interactive polling interface showing live vote distributions and visual progress bars.
- **🔗 Cryptographic Audit Ledger:** Tamper-evident ledger using SHA-256 block hashing (chaining previous hash to current transaction) to verify data integrity.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js 5
- **Database:** SQLite3
- **Security & Integrity:** SHA-256 Cryptographic Hashing (`crypto` module)
- **Frontend:** Clean, responsive HTML5 & CSS3 interface

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# In the apps/web directory
cd apps/web
npm install
```

### 2. Start the Server
```bash
npm start
```
*Runs `node --watch index.js` on port `3000`.*

### 3. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) to access the Vote Wallet dashboard.

---

## 📁 Project Structure

```
vote-genz-wallet/
├── apps/
│   └── web/
│       ├── data.json           # Mock voter & candidate data
│       ├── index.js            # Express application & API endpoints
│       └── package.json        # Web app dependencies & scripts
├── db/                         # SQLite database storage (runtime)
├── docs/                       # Project documentation
├── infra/                      # Infrastructure and deployment scripts
├── services/                   # Background services
├── .gitignore                  # Git ignore rules
└── README.md                   # Project overview and instructions
```
