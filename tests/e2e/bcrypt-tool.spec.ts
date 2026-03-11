import { expect, test } from '@/tests/e2e/fixtures';

const bcryptHashPattern = /^\$2[aby]\$04\$[./A-Za-z0-9]{53}$/;

test.describe('Bcrypt tool', () => {
  test('discovers the bcrypt tool from the catalog and generates a salted hash', async ({ page, runAxe }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Open Bcrypt Hash Generator/i })).toBeVisible();
    await page.getByRole('link', { name: /Open Bcrypt Hash Generator/i }).click();

    await expect(page).toHaveURL(/\/tools\/bcrypt$/);
    await expect(page.getByRole('heading', { name: /Bcrypt Hash Generator/i })).toBeVisible();
    await expect(page.getByText(/Fresh salts change the output/i)).toBeVisible();

    await page.getByLabel(/Plain text/i).fill('correct horse battery staple');
    await page.getByLabel(/Rounds/i).fill('4');
    await page.getByRole('button', { name: /Generate bcrypt hash/i }).click();

    await expect(page.getByText(/Bcrypt hash generated with 4 rounds/i)).toBeVisible();
    await expect(page.getByRole('region', { name: /Bcrypt hash/i }).locator('pre code')).toHaveText(
      bcryptHashPattern
    );

    await page.getByRole('button', { name: /Copy result/i }).click();
    await expect(page.getByText(/Copied to clipboard|Copy unavailable/i)).toBeVisible();
    await runAxe('main');
  });

  test('shows validation feedback for empty input and out-of-range rounds', async ({ page }) => {
    await page.goto('/tools/bcrypt');

    await page.getByLabel(/Plain text/i).fill('   ');
    await page.getByLabel(/Rounds/i).fill('21');
    await page.getByRole('button', { name: /Generate bcrypt hash/i }).click();

    await expect(page.locator('#bcrypt-input-error')).toContainText(/Plain text is required/i);
    await expect(page.locator('#bcrypt-rounds-error')).toContainText(/Rounds must be between 1 and 20/i);
  });
});
