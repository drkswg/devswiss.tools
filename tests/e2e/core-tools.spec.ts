import { expect, test } from '@/tests/e2e/fixtures';

test.describe('Core tools', () => {
  test('homepage renders the catalog and passes an accessibility smoke check', async ({ page, runAxe }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: /Your data stays in the browser/i
      })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Open UUID Generator & Validator/i })).toBeVisible();
    await runAxe('main');
  });

  test('UUID, Base64, and Hash routes support a basic happy path', async ({ page, runAxe }) => {
    await page.goto('/tools/uuid');
    await page.getByRole('button', { name: /Generate UUID/i }).click();
    await expect(page.getByText(/Generated a V4 UUID/i)).toBeVisible();
    await runAxe('main');

    await page.goto('/tools/base64');
    const base64Input = page.getByLabel(/Plain text/i);
    await expect(base64Input).toBeVisible();
    await base64Input.fill('');
    await base64Input.type('hello devswiss.tools');
    await expect(base64Input).toHaveValue('hello devswiss.tools');
    await page.getByRole('button', { name: /Encode text/i }).click();
    await expect(page.getByText('aGVsbG8gZGV2c3dpc3MudG9vbHM=')).toBeVisible();
    await runAxe('main');

    await page.goto('/tools/hash');
    const hashInput = page.getByLabel(/Plain text/i);
    await expect(hashInput).toBeVisible();
    await hashInput.fill('');
    await hashInput.type('hello');
    await expect(hashInput).toHaveValue('hello');
    await page.getByRole('button', { name: /Generate hash/i }).click();
    await expect(
      page.getByText('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    ).toBeVisible();
    await runAxe('main');
  });
});
