const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Shared db folder path
const DB_DIR = path.join(__dirname, '..', '..', 'db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'vote_wallet.sqlite');
const db = new sqlite3.Database(DB_PATH);

app.use(express.json());

// Helper: Calculate SHA-256 hash for ledger entry
function calculateHash(prevHash, actionType, detail, timestamp) {
  return crypto
    .createHash('sha256')
    .update(`${prevHash}|${actionType}|${detail}|${timestamp}`)
    .digest('hex');
}

// Helper: Append block to the audit ledger
function appendLedger(actionType, detail, callback) {
  db.get(`SELECT tx_hash FROM transactions ORDER BY id DESC LIMIT 1`, (err, lastTx) => {
    const prevHash = lastTx ? lastTx.tx_hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const hash = calculateHash(prevHash, actionType, detail, timestamp);

    db.run(
      `INSERT INTO transactions (tx_hash, prev_hash, action_type, detail, created_at) VALUES (?, ?, ?, ?, ?)`,
      [hash, prevHash, actionType, detail, timestamp],
      callback
    );
  });
}

// Database Schema Initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      address TEXT UNIQUE NOT NULL,
      credits INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      votes INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT NOT NULL,
      prev_hash TEXT NOT NULL,
      action_type TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Seed wallets if empty
  db.get(`SELECT COUNT(*) as count FROM wallets`, (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO wallets (label, address, credits) VALUES 
        ('Wallet 1 (Alice)', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 10),
        ('Wallet 2 (Bob)', '0x534649708CabFD6f5174e95747356c323f4c8032', 8),
        ('Wallet 3 (Charlie)', '0x8ba1f109551bD432803012645Ac136ddd64DBA72', 15)
      `);
    }
  });

  // Seed candidates if empty
  db.get(`SELECT COUNT(*) as count FROM candidates`, (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO candidates (name, votes) VALUES ('Candidate A', 0), ('Candidate B', 0)`);
    }
  });
});

// UI Route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vote Wallet Ledger</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 740px; margin: 30px auto; padding: 20px; color: #1e293b; background: #f8fafc; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); background: #ffffff; }
          .btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
          .btn:hover { background: #1d4ed8; }
          .btn-secondary { background: #059669; }
          .btn-secondary:hover { background: #047857; }
          .btn-verify { background: #4f46e5; width: 100%; padding: 10px; margin-bottom: 12px; font-weight: 600; }
          .btn-verify:hover { background: #4338ca; }
          .candidate-row { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
          .candidate-row:last-child { border-bottom: none; }
          .candidate-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .progress-bar-container { background: #e2e8f0; border-radius: 6px; height: 8px; overflow: hidden; width: 100%; }
          .progress-bar { background: #2563eb; height: 100%; transition: width 0.3s ease; }
          .input-group { display: flex; gap: 10px; margin-top: 12px; }
          select, input { flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; }
          .badge { background: #e0e7ff; color: #3730a3; padding: 2px 10px; border-radius: 12px; font-size: 14px; font-weight: 600; }
          .ledger-box { max-height: 240px; overflow-y: auto; font-family: monospace; font-size: 11px; background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; }
          .ledger-item { padding: 8px 0; border-bottom: 1px solid #334155; }
          .hash-tag { color: #38bdf8; word-break: break-all; }
          .prev-tag { color: #94a3b8; word-break: break-all; }
          .status-banner { padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; margin-bottom: 12px; display: none; }
          .status-valid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .status-invalid { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        </style>
      </head>
      <body>
        <h2>Vote Wallet Ledger</h2>
        
        <div class="card">
          <h3>Active Wallet Account</h3>
          <div style="margin-bottom: 14px;">
            <label style="font-size: 13px; font-weight: 600; color: #64748b;">Select Connected Wallet:</label>
            <div class="input-group" style="margin-top: 6px;">
              <select id="wallet-select" onchange="changeWallet()"></select>
            </div>
          </div>
          <p><strong>Address:</strong> <code id="wallet-address">Loading...</code></p>
          <p><strong>Credits Remaining:</strong> <span class="badge" id="credits">0</span></p>
          <div class="input-group">
            <input type="number" id="recharge-amount" placeholder="Enter credits (e.g. 5)" min="1" />
            <button class="btn btn-secondary" onclick="rechargeCredits()">+ Recharge</button>
          </div>
        </div>

        <div class="card">
          <h3>Active Poll</h3>
          <div id="candidate-list"></div>
        </div>

        <div class="card">
          <h3>Register Candidate</h3>
          <div class="input-group">
            <input type="text" id="candidate-name" placeholder="Candidate name..." />
            <button class="btn" onclick="addCandidate()">Add Candidate</button>
          </div>
        </div>

        <div class="card">
          <h3>Cryptographic Audit Chain</h3>
          <button class="btn btn-verify" onclick="verifyLedger()">🔍 Verify Ledger Integrity</button>
          <div id="verify-status" class="status-banner"></div>
          <div class="ledger-box" id="ledger-box">Loading ledger...</div>
        </div>

        <script>
          let currentWalletId = 1;

          async function loadData() {
            const res = await fetch('/api/poll?walletId=' + currentWalletId);
            const data = await res.json();
            
            const select = document.getElementById('wallet-select');
            if (select.children.length === 0 && data.wallets) {
              select.innerHTML = data.wallets.map(w => \`
                <option value="\${w.id}" \${w.id === currentWalletId ? 'selected' : ''}>\${w.label}</option>
              \`).join('');
            }

            if (data.activeWallet) {
              document.getElementById('wallet-address').innerText = data.activeWallet.address;
              document.getElementById('credits').innerText = data.activeWallet.credits;
            }
            
            const totalVotes = data.candidates.reduce((sum, c) => sum + c.votes, 0);
            const listDiv = document.getElementById('candidate-list');
            listDiv.innerHTML = data.candidates.map(c => {
              const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
              return \`
                <div class="candidate-row">
                  <div class="candidate-header">
                    <span><strong>\${c.name}</strong> — \${c.votes} votes (\${pct}%)</span>
                    <button class="btn" onclick="vote(\${c.id})">Vote</button>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar" style="width: \${pct}%;"></div>
                  </div>
                </div>
              \`;
            }).join('');

            const ledgerBox = document.getElementById('ledger-box');
            if (data.transactions && data.transactions.length > 0) {
              ledgerBox.innerHTML = data.transactions.map(tx => \`
                <div class="ledger-item">
                  <div><strong>[\${tx.action_type}]</strong> \${tx.detail}</div>
                  <div>HASH: <span class="hash-tag">\${tx.tx_hash}</span></div>
                  <div>PREV: <span class="prev-tag">\${tx.prev_hash}</span></div>
                  <div style="color: #64748b;">TIMESTAMP: \${tx.created_at}</div>
                </div>
              \`).join('');
            } else {
              ledgerBox.innerHTML = 'Ledger is empty.';
            }
          }

          function changeWallet() {
            currentWalletId = parseInt(document.getElementById('wallet-select').value, 10);
            loadData();
          }

          async function vote(id) {
            const res = await fetch('/api/vote', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ candidateId: id, walletId: currentWalletId })
            });
            const result = await res.json();
            if (result.error) alert(result.error);
            else loadData();
          }

          async function addCandidate() {
            const input = document.getElementById('candidate-name');
            const name = input.value.trim();
            if (!name) return;

            await fetch('/api/candidates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, walletId: currentWalletId })
            });
            input.value = '';
            loadData();
          }

          async function rechargeCredits() {
            const input = document.getElementById('recharge-amount');
            const amount = parseInt(input.value, 10);
            if (!amount || amount <= 0) return;

            await fetch('/api/wallet/recharge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, walletId: currentWalletId })
            });
            input.value = '';
            loadData();
          }

          async function verifyLedger() {
            const statusDiv = document.getElementById('verify-status');
            statusDiv.style.display = 'block';
            statusDiv.className = 'status-banner';
            statusDiv.innerText = 'Calculating hashes across full transaction chain...';

            const res = await fetch('/api/ledger/verify');
            const result = await res.json();

            if (result.valid) {
              statusDiv.className = 'status-banner status-valid';
              statusDiv.innerHTML = '✓ <strong>Ledger Verified:</strong> All ' + result.totalBlocks + ' cryptographic blocks intact. No tampering detected.';
            } else {
              statusDiv.className = 'status-banner status-invalid';
              statusDiv.innerHTML = '⚠ <strong>Tampering Detected:</strong> Integrity check failed at transaction ID #' + result.failedAtId + ': ' + result.reason;
            }
          }

          loadData();
        </script>
      </body>
    </html>
  `);
});

// APIs
app.get('/api/poll', (req, res) => {
  const walletId = req.query.walletId || 1;
  db.all(`SELECT id, label, address, credits FROM wallets`, (err, wallets) => {
    const activeWallet = (wallets || []).find(w => w.id === parseInt(walletId, 10)) || (wallets ? wallets[0] : null);
    db.all(`SELECT id, name, votes FROM candidates`, (err, candidates) => {
      db.all(`SELECT tx_hash, prev_hash, action_type, detail, created_at FROM transactions ORDER BY id DESC LIMIT 15`, (err, transactions) => {
        res.json({
          wallets: wallets || [],
          activeWallet: activeWallet || {},
          candidates: candidates || [],
          transactions: transactions || []
        });
      });
    });
  });
});

app.post('/api/vote', (req, res) => {
  const { candidateId, walletId } = req.body;

  db.get(`SELECT address, credits FROM wallets WHERE id = ?`, [walletId], (err, wallet) => {
    if (!wallet || wallet.credits <= 0) {
      return res.status(400).json({ error: "Insufficient voting credits in selected wallet!" });
    }

    db.get(`SELECT name FROM candidates WHERE id = ?`, [candidateId], (err, candidate) => {
      if (!candidate) return res.status(404).json({ error: "Candidate not found" });

      db.serialize(() => {
        db.run(`UPDATE candidates SET votes = votes + 1 WHERE id = ?`, [candidateId]);
        db.run(`UPDATE wallets SET credits = credits - 1 WHERE id = ?`, [walletId]);

        const shortAddr = wallet.address.substring(0, 6) + '...' + wallet.address.substring(wallet.address.length - 4);
        appendLedger('VOTE_CAST', `${shortAddr} voted for ${candidate.name}`, () => {
          res.json({ success: true });
        });
      });
    });
  });
});

app.post('/api/candidates', (req, res) => {
  const { name, walletId } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  db.get(`SELECT address FROM wallets WHERE id = ?`, [walletId], (err, wallet) => {
    const shortAddr = wallet ? (wallet.address.substring(0, 6) + '...' + wallet.address.substring(wallet.address.length - 4)) : 'Admin';
    db.serialize(() => {
      db.run(`INSERT INTO candidates (name, votes) VALUES (?, 0)`, [name]);
      appendLedger('CANDIDATE_ADDED', `${shortAddr} added candidate: ${name}`, () => {
        res.json({ success: true });
      });
    });
  });
});

app.post('/api/wallet/recharge', (req, res) => {
  const { amount, walletId } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  db.get(`SELECT address FROM wallets WHERE id = ?`, [walletId], (err, wallet) => {
    const shortAddr = wallet ? (wallet.address.substring(0, 6) + '...' + wallet.address.substring(wallet.address.length - 4)) : 'Wallet';
    db.serialize(() => {
      db.run(`UPDATE wallets SET credits = credits + ? WHERE id = ?`, [amount, walletId]);
      appendLedger('CREDIT_RECHARGE', `${shortAddr} recharged +${amount} credits`, () => {
        res.json({ success: true });
      });
    });
  });
});

app.get('/api/ledger/verify', (req, res) => {
  db.all(`SELECT id, tx_hash, prev_hash, action_type, detail, created_at FROM transactions ORDER BY id ASC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const txs = rows || [];
    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const expectedPrevHash = i === 0
        ? '0000000000000000000000000000000000000000000000000000000000000000'
        : txs[i - 1].tx_hash;

      if (tx.prev_hash !== expectedPrevHash) {
        return res.json({
          valid: false,
          failedAtId: tx.id,
          reason: `Broken chain link: prev_hash does not match previous transaction hash`
        });
      }

      const expectedHash = calculateHash(tx.prev_hash, tx.action_type, tx.detail, tx.created_at);
      if (tx.tx_hash !== expectedHash) {
        return res.json({
          valid: false,
          failedAtId: tx.id,
          reason: `Cryptographic mismatch: calculated hash does not match stored tx_hash`
        });
      }
    }

    res.json({
      valid: true,
      totalBlocks: txs.length
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
