import { test, expect } from '@playwright/test';

test.describe('Electoral Voting Lifecycle E2E Test', () => {
  test('Complete citizen journey: Landing -> Login -> OTP -> Identity -> Biometric Consent -> Face & Hardware Verify -> Ballot Cast -> Merkle Receipt', async ({
    page,
  }) => {
    // 1. Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Vote Wallet/);
    await expect(page.getByRole('heading', { name: /Zero-Knowledge/i })).toBeVisible();

    // 2. Navigate to Login
    await page.getByRole('button', { name: /Enter Voting Booth/i }).click();
    await expect(page).toHaveURL(/.*login/);

    // 3. Enter Voter ID and Submit
    const voterIdInput = page.getByLabel(/National Voter ID/i);
    await voterIdInput.fill('EPIC987654321');
    await page.getByRole('button', { name: /Send One-Time Passcode/i }).click();

    // 4. Verify OTP
    await expect(page).toHaveURL(/.*verify-otp/);
    await page.getByPlaceholder('••••••').fill('123456');
    await page.getByRole('button', { name: /Confirm Passcode/i }).click();

    // 5. Voter Identity Card
    await expect(page).toHaveURL(/.*identity/);
    await expect(page.getByText('Suresh Kumar Sharma')).toBeVisible();
    await expect(page.getByText('AC-142 Bangalore South')).toBeVisible();
    await page.getByRole('button', { name: /Proceed to Biometric Verification/i }).click();

    // 6. Biometric Consent Screen
    await expect(page).toHaveURL(/.*consent/);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /I Consent & Proceed/i }).click();

    // 7. Facial Liveness & Embedding Verification
    await expect(page).toHaveURL(/.*verify\/face/);
    await page.getByRole('button', { name: /Capture & Verify Face/i }).click();

    // 8. Hardware Biometric Verification (WebAuthn)
    await expect(page).toHaveURL(/.*verify\/fingerprint/);
    await page.getByRole('button', { name: /Activate Hardware Sensor/i }).click();

    // 9. Candidate Ballot Slate Selection
    await expect(page).toHaveURL(/.*ballot/);
    await page.getByText('Aarav Rajesh Verma').click();
    await page.getByRole('button', { name: /Review Ballot Selection/i }).click();

    // 10. Review & Final Cryptographic Seal
    await expect(page).toHaveURL(/.*review/);
    await expect(page.getByText('Aarav Rajesh Verma')).toBeVisible();
    await page.getByRole('button', { name: /Seal & Cast Ballot Now/i }).click();

    // 11. Receipt Issuance & Verification
    await expect(page).toHaveURL(/.*receipt/);
    await expect(page.getByText(/Official Ballot Receipt/i)).toBeVisible();
    await expect(page.getByText(/Merkle Root/i)).toBeVisible();

    // 12. Check Receipt on Public Ledger
    await page.getByRole('button', { name: /Verify on Public Ledger/i }).click();
    await expect(page).toHaveURL(/.*check-receipt/);
    await expect(page.getByRole('heading', { name: /Verify Ballot Inclusion/i })).toBeVisible();
  });
});
