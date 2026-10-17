const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting End-to-End Voting Lifecycle & Merkle Audit Test...\n');

const PORT = 3098;
const serverProc = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, '..', 'apps', 'web'),
  env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
  stdio: 'pipe'
});

serverProc.stderr.on('data', (d) => {
  // console.error('Server err:', d.toString());
});

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: pathUrl,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runLifecycle() {
  // Wait for server to boot
  let online = false;
  for (let i = 0; i < 20; i++) {
    try {
      const h = await request('GET', '/api/health');
      if (h.status === 200) {
        online = true;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  assert(online, 'Server did not come online');
  console.log('  ✓ 1. Server is live and healthy.');

  // Reset election state for deterministic automated test execution
  await request('POST', '/api/admin/reset-election');

  // Step 1: Login OTP Request
  const loginRes = await request('POST', '/api/auth/login', { voterCode: 'VOTER-SAN8639' });
  assert.strictEqual(loginRes.status, 200);
  assert(loginRes.data.demoOtp, 'demoOtp should be present in test mode');
  const otp = loginRes.data.demoOtp;
  console.log(`  ✓ 2. OTP generated securely for Sandeep: ${otp}`);

  // Step 2: Verify OTP
  const verifyRes = await request('POST', '/api/auth/verify-otp', {
    voterCode: 'VOTER-SAN8639',
    otp
  });
  assert.strictEqual(verifyRes.status, 200);
  assert(verifyRes.data.sessionToken, 'Session token should be issued');
  const token = verifyRes.data.sessionToken;
  console.log(`  ✓ 3. Session authenticated with Bearer token: ${token.substring(0, 16)}...`);

  // Step 3: Issue Anonymous Ballot Token
  const tokenRes = await request('POST', '/api/vote/token', { electionId: 1 }, {
    'Authorization': `Bearer ${token}`
  });
  assert.strictEqual(tokenRes.status, 200);
  assert(tokenRes.data.anonymousToken, 'Anonymous single-use token issued');
  const anonToken = tokenRes.data.anonymousToken;
  console.log(`  ✓ 4. Identity decoupled: Anonymous single-use token issued: ${anonToken.substring(0, 16)}...`);

  // Step 4: Cast Ballot
  const castRes = await request('POST', '/api/vote/cast', {
    anonymousToken: anonToken,
    candidateId: 1,
    electionId: 1
  }, {
    'Authorization': `Bearer ${token}`
  });
  assert([200, 202].includes(castRes.status), `Cast status unexpected: ${castRes.status}`);
  const { receiptCode, receiptHash } = castRes.data;
  assert(receiptHash, 'Receipt hash must be generated');
  console.log(`  ✓ 5. Ballot cast & encrypted! Receipt Code: ${receiptCode}, Receipt Hash: ${receiptHash.substring(0, 16)}...`);

  // Step 5: Duplicate Vote Prevention
  const dupTokenRes = await request('POST', '/api/vote/token', { electionId: 1 }, {
    'Authorization': `Bearer ${token}`
  });
  assert.strictEqual(dupTokenRes.status, 400);
  console.log('  ✓ 6. Duplicate voting strictly prevented at token issuance.');

  // Step 6: Merkle Tree Inclusion Proof Verification
  const proofRes = await request('GET', `/api/vote/merkle-proof/${receiptHash}`);
  assert.strictEqual(proofRes.status, 200);
  assert.strictEqual(proofRes.data.verified, true, 'Cryptographic Merkle inclusion proof must verify');
  console.log(`  ✓ 7. O(log N) Cryptographic Merkle Inclusion Proof verified! Root: ${proofRes.data.merkleRoot.substring(0, 20)}...`);
  console.log(`       Proof length: ${proofRes.data.proof.length} hashes (${proofRes.data.complexity})`);

  console.log('\n🎉 FULL END-TO-END VOTING & CRYPTOGRAPHIC VERIFICATION SUITE PASSED!\n');
}

runLifecycle()
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    serverProc.kill();
  });
