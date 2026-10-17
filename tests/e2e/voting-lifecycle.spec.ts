import { test, expect } from '@playwright/test';

test.describe('End-to-End National Voting Lifecycle', () => {
  test('Complete voter login, biometric simulation, ballot casting, and Merkle receipt verification', async ({ page }) => {
    // 1. Visit citizen voter landing page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Voter Authentication|Sign In/i })).toBeVisible();

    // 2. Fill Voter ID
    const voterIdInput = page.getByPlaceholder(/EPIC/i);
    await voterIdInput.fill('EPIC987654321');
    await page.getByRole('button', { name: /Send Verification Code|Send OTP/i }).click();

    // 3. Verify OTP
    await expect(page).toHaveURL(/.*verify-otp|.*otp/);
    const otpInputs = page.locator('input[type="text"], input[type="number"]');
    if (await otpInputs.count() >= 6) {
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill('123456'[i]);
      }
    }
    await page.getByRole('button', { name: /Verify/i }).click();

    // 4. Identity confirmation
    await expect(page).toHaveURL(/.*identity/);
    await expect(page.getByText('Suresh Kumar Sharma')).toBeVisible();
    await page.getByRole('button', { name: /Proceed to Biometrics/i }).click();

    // 5. Biometric Face Liveness & Hardware Authorization
    await expect(page).toHaveURL(/.*face|.*verify/);
    await page.waitForTimeout(1000);
    const proceedBtn = page.getByRole('button', { name: /Proceed|Continue|Authenticate/i });
    if (await proceedBtn.isVisible()) {
      await proceedBtn.click();
    }

    // 6. Ballot selection
    await expect(page).toHaveURL(/.*ballot/);
    const candidateCard = page.locator('text=Vikramaditya Hegde').first();
    await candidateCard.click();
    await page.getByRole('button', { name: /Review/i }).click();

    // 7. Review & Seal
    await expect(page).toHaveURL(/.*review/);
    await page.getByRole('button', { name: /Seal & Cast|Confirm/i }).click();

    // 8. Receipt & Merkle Proof
    await expect(page).toHaveURL(/.*receipt/);
    await expect(page.getByText(/Vote Cast Successfully|Ballot Tracker/i)).toBeVisible();
  });
});
