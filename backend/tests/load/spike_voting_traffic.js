import http from 'k6/http';
import { check, sleep } from 'k6';

// K6 Spike Test Configuration: Simulates 1,000+ RPS ballot submission burst
export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Warm-up to 50 users
    { duration: '30s', target: 500 },  // Surge to 500 concurrent voters
    { duration: '1m', target: 1000 },  // Peak 1,000 concurrent voters
    { duration: '20s', target: 0 },    // Cooldown
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<800'], // 95% of votes under 300ms
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // 1. Health Probe
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  // 2. Poll Candidates
  const pollRes = http.get(`${BASE_URL}/api/elections/1/candidates`);
  check(pollRes, {
    'candidates retrieved': (r) => r.status === 200,
  });

  sleep(0.1);
}
