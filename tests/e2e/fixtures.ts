import AxeBuilder from '@axe-core/playwright';
import { expect, test as base } from '@playwright/test';

export { expect };

export const test = base.extend<{ runAxe: (selector?: string) => Promise<void> }>({
  runAxe: async ({ page }, registerRunAxe) => {
    await registerRunAxe(async (selector) => {
      const builder = new AxeBuilder({ page });

      if (selector) {
        builder.include(selector);
      }

      const results = await builder.analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
