import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 50 },   // Warm up to 50 concurrent voters
    { duration: '1m', target: 250 },   // Peak surge: 250 parallel voters
    { duration: '30s', target: 500 },  // Election close rush: 500 parallel voters
    { duration: '20s', target: 0 },    // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'], // 95% under 300ms, 99% under 500ms
    http_req_failed: ['rate<0.005'],               // Less than 0.5% failure rate
  },
};

const TARGET_HOST = __ENV.API_HOST || 'http://localhost:3000';

export default function () {
  const voterSeed = `${__VU}_${__ITER}_${Date.now()}`;
  const anonymousToken = `vtoken_k6_${voterSeed}`;
  const trackerHash = `0x${voterSeed.split('').map(c => c.charCodeAt(0).toString(16)).join('')}`;

  const payload = JSON.stringify({
    electionId: '1',
    candidateId: Math.floor(Math.random() * 4) + 1,
    anonymousToken: anonymousToken,
    encryptedVote: 'k6_simulated_ciphertext_payload_aes256',
    trackerHash: trackerHash,
  });

  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Version': '2.0.0-mobile',
  };

  const res = http.post(`${TARGET_HOST}/api/vote/cast`, payload, { headers });

  check(res, {
    'vote cast accepted (200, 201, or 202)': (r) => [200, 201, 202].includes(r.status),
    'receipt returned in response': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!(body.receiptHash || body.receiptCode || body.trackerHash);
      } catch (_) {
        return false;
      }
    },
  });

  sleep(0.5);
}
