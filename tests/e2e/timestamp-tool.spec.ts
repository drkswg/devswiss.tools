import { expect, test } from '@/tests/e2e/fixtures';

test.describe('Timestamp tool', () => {
  test('supports catalog discovery and direct navigation to the timestamp page', async ({ page, runAxe }) => {
    await page.goto('/');

    const timestampLink = page.getByRole('link', { name: /Open Timestamp Converter/i });
    await expect(timestampLink).toHaveAttribute('href', '/tools/timestamp');
    await timestampLink.click();

    await expect(page.getByRole('heading', { name: /Timestamp Converter/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /Timestamp explainer workflow/i })).toBeVisible();
    await runAxe('main');
  });

  test('explains a timestamp and generates a copy-ready UTC result', async ({ page, runAxe }) => {
    await page.goto('/tools/timestamp');

    await page.getByLabel(/^Unix timestamp/i).fill('1712297105');
    await page.getByRole('button', { name: /Explain timestamp/i }).click();

    await expect(page.getByText(/Timestamp explained as seconds/i)).toBeVisible();
    await expect(page.getByRole('region', { name: /Normalized timestamp/i }).getByText('1712297105')).toBeVisible();
    await expect(page.locator('section[aria-label="Timestamp explanation details"]')).toContainText(
      '2024-04-05 06:05:05 UTC'
    );

    await page.getByLabel(/^Date and time/i).fill('2024-04-05T10:05:05');
    await page.getByLabel(/^Timezone/i).selectOption('utc');
    await page.getByLabel(/^Output unit/i).selectOption('seconds');
    await page.getByRole('button', { name: /Generate timestamp/i }).click();

    const generatedResult = page.getByRole('region', { name: /^Generated timestamp$/i });

    await expect(page.getByText(/Timestamp generated in seconds/i)).toBeVisible();
    await expect(generatedResult.getByText('1712311505', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Copy result/i }).click();
    await expect(page.getByText(/Copied to clipboard|Copy unavailable/i)).toBeVisible();
    await runAxe('main');
  });

  test('stacks the explain and generate workflows on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1200 });
    await page.goto('/tools/timestamp');

    const explainWorkflow = page.getByRole('region', { name: /Timestamp explainer workflow/i });
    const generateWorkflow = page.getByRole('region', { name: /Timestamp generator workflow/i });
    const explainBox = await explainWorkflow.boundingBox();
    const generateBox = await generateWorkflow.boundingBox();

    expect(explainBox).not.toBeNull();
    expect(generateBox).not.toBeNull();
    expect(Math.abs((explainBox?.x ?? 0) - (generateBox?.x ?? 0)) < 8).toBe(true);
    expect((explainBox?.y ?? 0) < (generateBox?.y ?? 0)).toBe(true);
  });
});
