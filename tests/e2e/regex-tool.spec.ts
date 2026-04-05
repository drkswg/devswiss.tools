import { expect, test } from '@/tests/e2e/fixtures';

test.describe('Regex tool', () => {
  test('supports catalog discovery and direct navigation to the regex page', async ({ page, runAxe }) => {
    await page.goto('/');

    const regexLink = page.getByRole('link', { name: /Open Regex Tester/i });
    await expect(regexLink).toHaveAttribute('href', '/tools/regex');
    await regexLink.click();

    await expect(page.getByRole('heading', { name: /Regex Tester/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /Regex tester workflow/i })).toBeVisible();
    await runAxe('main');
  });

  test('analyzes Java and PL\/SQL patterns with honest execution feedback', async ({ page, runAxe }) => {
    await page.goto('/tools/regex');

    await page.getByLabel(/^Regex expression/i).fill('(?i)^([a-z]{3})-(\\d+)$');
    await page.getByLabel(/^Sample text/i).fill('ABC-42');
    await page.getByRole('button', { name: /Analyze regex/i }).click();

    await expect(page.getByText(/matched against the sample text for Java/i)).toBeVisible();
    await expect(page.locator('section[aria-label="Regex match details"]')).toContainText('Group 1:');
    await expect(page.locator('section[aria-label="Regex match details"]')).toContainText('ABC');

    await page.getByLabel(/^Regex flavor/i).selectOption('plsql');
    await page.getByLabel(/^Regex expression/i).fill('([[:digit:]]{2})/[[:digit:]]{2}');
    await page.getByLabel(/^Sample text/i).fill('ID 12/34 OK');
    await page.getByRole('button', { name: /Analyze regex/i }).click();

    await expect(page.locator('section[aria-label="Regex match details"]')).toContainText('([0-9]{2})/[0-9]{2}');
    await expect(page.locator('section[aria-label="Regex match details"]')).toContainText('12/34');
    await runAxe('main');
  });

  test('shows unsupported-pattern feedback instead of misleading match rows', async ({ page }) => {
    await page.goto('/tools/regex');

    await page.getByLabel(/^Regex expression/i).fill('(?<=ID-)\\d++');
    await page.getByLabel(/^Sample text/i).fill('ID-42');
    await page.getByRole('button', { name: /Analyze regex/i }).click();

    const matchRegion = page.locator('section[aria-label="Regex match details"]');

    await expect(matchRegion).toContainText('Lookbehind assertions are explained');
    await expect(matchRegion).not.toContainText('Match 1');
  });

  test('stacks the explanation and match sections on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1200 });
    await page.goto('/tools/regex');

    const explanation = page.getByRole('region', { name: /Regex explanation/i });
    const matches = page.getByRole('region', { name: /Regex match details/i });
    const explanationBox = await explanation.boundingBox();
    const matchesBox = await matches.boundingBox();

    expect(explanationBox).not.toBeNull();
    expect(matchesBox).not.toBeNull();
    expect(Math.abs((explanationBox?.x ?? 0) - (matchesBox?.x ?? 0)) < 8).toBe(true);
    expect((explanationBox?.y ?? 0) < (matchesBox?.y ?? 0)).toBe(true);
  });
});
