import { expect, test } from '@/tests/e2e/fixtures';

test.describe('Cron tool', () => {
  test('shows builder and explainer workflows together and explains a pasted expression', async ({ page, runAxe }) => {
    await page.goto('/tools/cron');

    const builderWorkflow = page.getByRole('region', { name: /Cron builder workflow/i });
    const explainerWorkflow = page.getByRole('region', { name: /Cron explainer workflow/i });

    await expect(builderWorkflow.getByRole('heading', { name: /Build a 5-field or 6-field cron expression/i })).toBeVisible();
    await expect(explainerWorkflow.getByRole('heading', { name: /Explain a 5-field or 6-field cron expression/i })).toBeVisible();

    const builderBox = await builderWorkflow.boundingBox();
    const explainerBox = await explainerWorkflow.boundingBox();

    expect(builderBox).not.toBeNull();
    expect(explainerBox).not.toBeNull();
    expect((builderBox?.x ?? 0) < (explainerBox?.x ?? 0)).toBe(true);

    await page.getByRole('textbox', { name: /Cron expression/i }).fill('0 */15 * * * *');
    await page.getByRole('button', { name: /Explain cron expression/i }).click();

    await expect(page.getByText(/Cron expression explained/i)).toBeVisible();
    await expect(page.getByRole('region', { name: /Normalized cron expression/i }).getByText('0 */15 * * * *')).toBeVisible();
    await expect(page.locator('section[aria-label="Cron explanation summary"]')).toContainText(/Every 15 minutes/i);
    await runAxe('main');
  });

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
    await expect(page.getByRole('region', { name: /^Cron expression$/i }).getByText('0 */15 * * * *')).toBeVisible();
    await expect(page.locator('section[aria-label="Readable schedule summary"]')).toContainText(
      /Every 15 minutes/i
    );

    await page.getByRole('button', { name: /Copy result/i }).click();
    await expect(page.getByText(/Copied to clipboard|Copy unavailable/i)).toBeVisible();
    await runAxe('main');
  });

  test('builds a five-field expression when seconds are omitted', async ({ page, runAxe }) => {
    await page.goto('/tools/cron');

    await page.getByLabel(/^Expression format/i).selectOption('5');
    await expect(page.getByLabel(/^Seconds/i)).toHaveCount(0);

    await page.getByLabel(/^Minutes/i).selectOption('*/15');
    await page.getByLabel(/^Hours/i).selectOption('*');
    await page.getByLabel(/^Day of month/i).selectOption('*');
    await page.getByLabel(/^Month/i).selectOption('*');
    await page.getByLabel(/^Day of week/i).selectOption('*');

    await page.getByRole('button', { name: /Generate cron expression/i }).click();

    await expect(page.getByText(/Cron expression generated/i)).toBeVisible();
    await expect(page.getByRole('region', { name: /^Cron expression$/i }).getByText('*/15 * * * *')).toBeVisible();
    await expect(page.locator('section[aria-label="Readable schedule summary"]')).toContainText(
      /Every 15 minutes/i
    );
    await runAxe('main');
  });

  test('clarifies that wildcard seconds and minutes keep the selected hour active', async ({ page }) => {
    await page.goto('/tools/cron');

    await page.getByLabel(/^Seconds/i).selectOption('*');
    await page.getByLabel(/^Minutes/i).selectOption('*');
    await page.getByLabel(/^Hours/i).selectOption('12');
    await page.getByLabel(/^Day of month/i).selectOption('*');
    await page.getByLabel(/^Month/i).selectOption('*');
    await page.getByLabel(/^Day of week/i).selectOption('*');

    await page.getByRole('button', { name: /Generate cron expression/i }).click();

    await expect(page.locator('section[aria-label="Readable schedule summary"]')).toContainText(
      'Every second during the 12:00 PM hour every day'
    );
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

  test('stacks the builder and explainer workflows on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1200 });
    await page.goto('/tools/cron');

    const builderWorkflow = page.getByRole('region', { name: /Cron builder workflow/i });
    const explainerWorkflow = page.getByRole('region', { name: /Cron explainer workflow/i });
    const builderBox = await builderWorkflow.boundingBox();
    const explainerBox = await explainerWorkflow.boundingBox();

    expect(builderBox).not.toBeNull();
    expect(explainerBox).not.toBeNull();
    expect(Math.abs((builderBox?.x ?? 0) - (explainerBox?.x ?? 0)) < 8).toBe(true);
    expect((builderBox?.y ?? 0) < (explainerBox?.y ?? 0)).toBe(true);
  });
});
