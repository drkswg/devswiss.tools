import { expect, test } from '@/tests/e2e/fixtures';

test.describe('Cron tool', () => {
  test('builds a six-field expression, readable summary, and copy feedback', async ({ page, runAxe }) => {
    await page.goto('/tools/cron');

    await page.getByLabel(/^Seconds/i).selectOption('0');
    await page.getByLabel(/^Minutes/i).selectOption('*/15');
    await page.getByLabel(/^Hours/i).selectOption('*');
    await page.getByLabel(/^Day of month/i).selectOption('*');
    await page.getByLabel(/^Month/i).selectOption('*');
    await page.getByLabel(/^Day of week/i).selectOption('*');

    await page.getByRole('button', { name: /Generate cron expression/i }).click();

    await expect(page.getByText(/Cron expression generated/i)).toBeVisible();
    await expect(page.getByText('0 */15 * * * *')).toBeVisible();
    await expect(page.locator('section[aria-label="Readable schedule summary"]')).toContainText(
      /Every 15 minutes/i
    );

    await page.getByRole('button', { name: /Copy result/i }).click();
    await expect(page.getByText(/Copied to clipboard|Copy unavailable/i)).toBeVisible();
    await runAxe('main');
  });

  test('surfaces conflict errors for day-of-month and day-of-week', async ({ page, runAxe }) => {
    await page.goto('/tools/cron');

    await page.getByLabel(/^Seconds/i).selectOption('0');
    await page.getByLabel(/^Minutes/i).selectOption('0');
    await page.getByLabel(/^Hours/i).selectOption('9');
    await page.getByLabel(/^Day of month/i).selectOption('15');
    await page.getByLabel(/^Month/i).selectOption('*');
    await page.getByLabel(/^Day of week/i).selectOption('1-5');

    await page.getByRole('button', { name: /Generate cron expression/i }).click();

    await expect(page.locator('#cron-day-of-month-error')).toContainText(
      /Choose either day of month or day of week/i
    );
    await runAxe('main');
  });
});
