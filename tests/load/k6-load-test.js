import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Warm up
    { duration: '1m', target: 200 },   // Peak voter surge
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<350'],  // 95% of requests must complete within 350ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // 1. Health probe
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Voter Login Simulation
  const loginPayload = JSON.stringify({
    nationalId: `EPIC${Math.floor(100000000 + Math.random() * 900000000)}`,
  });
  const headers = { 'Content-Type': 'application/json' };

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
  check(loginRes, {
    'login status is 200 or 201': (r) => [200, 201].includes(r.status),
  });

  // 3. Merkle Leaf Verification query
  const testTracker = '0x8f43b1298c56e39a04bd8e32912a77f98c43912a9bc4821a98e21938ab491204';
  const verifyRes = http.get(`${BASE_URL}/api/vote/merkle-proof/${testTracker}`);
  check(verifyRes, {
    'merkle check response received': (r) => [200, 404].includes(r.status),
  });

  sleep(1);
}
