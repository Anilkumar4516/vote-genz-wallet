import { test, expect } from '@playwright/test';

test.describe('Security Audit: SQL Injection Resilience', () => {
  const sqlInjectionVectors = [
    "' OR '1'='1",
    "'; DROP TABLE voters; --",
    "1 UNION SELECT null, username, password FROM users --",
    "' OR 1=1 #",
    "admin' --",
    "' UNION ALL SELECT 1, 'hacked', 3 --",
    "SLEEP(5)",
    "'; EXEC xp_cmdshell('dir'); --",
  ];

  for (const vector of sqlInjectionVectors) {
    test(`Voter authentication rejects SQL injection vector: ${vector}`, async ({ request }) => {
      const startTime = Date.now();
      const res = await request.post('/api/auth/login', {
        data: {
          voterCode: vector,
          nationalId: vector,
        },
      });
      const duration = Date.now() - startTime;

      // No time-based blind SQL injection delays
      expect(duration).toBeLessThan(3000);

      // Must be handled gracefully without internal 500 database crashes or syntax dumps
      expect([400, 401, 404, 422]).toContain(res.status());

      const bodyText = await res.text();
      // Ensure raw database syntax errors are never leaked to client
      expect(bodyText.toLowerCase()).not.toContain('syntax error');
      expect(bodyText.toLowerCase()).not.toContain('pg_catalog');
      expect(bodyText.toLowerCase()).not.toContain('sqlite_master');
    });
  }

  test('Public ledger search endpoint parameterized against injection', async ({ request }) => {
    const maliciousTracker = "' UNION SELECT * FROM ballots --";
    const res = await request.get(`/api/vote/merkle-proof/${encodeURIComponent(maliciousTracker)}`);

    expect([400, 404]).toContain(res.status());
  });
});
