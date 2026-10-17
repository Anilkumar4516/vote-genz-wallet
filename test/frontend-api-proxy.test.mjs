// End-to-end verification of the full frontend-to-backend API flow through Vite dev proxy
const API_BASE = 'http://localhost:5173/api';

async function run() {
  console.log('--- 1. Fetching Election & Candidates through Vite Proxy ---');
  const candRes = await fetch(`${API_BASE}/elections/1/candidates`);
  const candData = await candRes.json();
  console.log(`✓ Election Loaded: "${candData.election.title}"`);
  console.log(`✓ Candidates count: ${candData.candidates.length}`);
  const candidate = candData.candidates[0];

  console.log('\n--- 2. Requesting OTP for Voter VOTER-HAR9704 ---');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voter_code: 'VOTER-HAR9704' })
  });
  const loginData = await loginRes.json();
  console.log('✓ Login Response:', loginData);
  const otp = loginData.demo_otp || loginData.demoOtp;
  if (!otp) throw new Error('No OTP returned');

  console.log('\n--- 3. Verifying OTP ---');
  const verifyRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voter_code: 'VOTER-HAR9704', otp })
  });
  const verifyData = await verifyRes.json();
  console.log('✓ Verified Voter:', verifyData.voter.full_name);
  const token = verifyData.session_token || verifyData.sessionToken;
  console.log('✓ Session JWT Acquired');

  console.log('\n--- 4. Requesting Anonymous Ballot Token ---');
  const tokenRes = await fetch(`${API_BASE}/vote/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ election_id: 1 })
  });
  const tokenData = await tokenRes.json();
  const anonToken = tokenData.anonymous_token || tokenData.anonymousToken;
  console.log(`✓ Anonymous Token Issued: ${anonToken.substring(0, 16)}...`);

  console.log(`\n--- 5. Casting Ballot for Candidate "${candidate.name}" ---`);
  const castRes = await fetch(`${API_BASE}/vote/cast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      election_id: 1,
      candidate_id: candidate.id,
      anonymous_token: anonToken
    })
  });
  const castData = await castRes.json();
  console.log('✓ Ballot Cast Successfully:', castData);
  const receiptHash = castData.receipt_hash || castData.receiptHash;

  console.log(`\n--- 6. Fetching Merkle Inclusion Proof for Receipt: ${receiptHash} ---`);
  const proofRes = await fetch(`${API_BASE}/vote/merkle-proof/${receiptHash}`);
  const proofData = await proofRes.json();
  const root = proofData.root_hash || proofData.merkle_root || proofData.merkleRoot;
  const leafHash = proofData.leaf_hash || proofData.leafHash || receiptHash;
  const leafIdx = proofData.leaf_index ?? proofData.leafIndex;
  const treeSize = proofData.total_ballots_in_tree ?? proofData.tree_size ?? proofData.totalBallotsInTree;
  const proof = proofData.proof || [];

  console.log('✓ Merkle Proof Response:');
  console.log('  Root Hash:   ', root);
  console.log('  Leaf Index:  ', leafIdx);
  console.log('  Tree Size:   ', treeSize);
  console.log('  Leaf Hash:   ', leafHash);
  console.log('  Proof Steps: ', proof.length);

  console.log('\n--- 7. Verifying Merkle Inclusion Proof (Client-side RFC 6962 Simulation) ---');
  const crypto = await import('crypto');
  let currentHash = leafHash;

  for (const step of proof) {
    const isLeft = (step.direction === 'left' || step.position === 'left');
    const left = isLeft ? step.hash : currentHash;
    const right = isLeft ? currentHash : step.hash;
    const buf = Buffer.concat([
      Buffer.from([0x01]), // RFC 6962 interior node prefix
      Buffer.from(left, 'hex'),
      Buffer.from(right, 'hex')
    ]);
    currentHash = crypto.createHash('sha256').update(buf).digest('hex');
  }

  if (currentHash.toLowerCase() === root.toLowerCase()) {
    console.log(`🌟 SUCCESS! Proof is mathematically verified! Root matches: ${currentHash}`);
  } else {
    console.error(`❌ Verification mismatch! Computed: ${currentHash}, Expected: ${root}`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
