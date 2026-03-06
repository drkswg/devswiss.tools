import { toolRegistry } from '@/lib/tools/registry';
import { expect, test } from '@/tests/e2e/fixtures';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('Catalog registry consistency', () => {
  test('homepage tiles match every registry entry', async ({ page, runAxe }) => {
    await page.goto('/');
    const catalog = page.locator('#tool-catalog');

    await expect(catalog.getByRole('link', { name: /^Open /i })).toHaveCount(toolRegistry.length);

    for (const tool of toolRegistry) {
      await expect(catalog.getByRole('link', { name: `Open ${tool.name}` })).toHaveAttribute(
        'href',
        tool.routePath
      );
    }

    await runAxe('main');
  });

  test('every registry route remains directly navigable', async ({ page }) => {
    for (const tool of toolRegistry) {
      await page.goto(tool.routePath);

      await expect(page.getByRole('heading', { name: new RegExp(escapeRegExp(tool.name), 'i') })).toBeVisible();
      await expect(page.getByRole('link', { name: /Back to catalog/i })).toBeVisible();
    }
  });
});
