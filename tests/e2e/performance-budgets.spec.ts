import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

import type { Page } from '@playwright/test';

import { expect, test } from '@/tests/e2e/fixtures';

type PerfMetrics = {
  cls: number;
  inp: number;
  jsBytes: number;
  lcp: number;
};

type PerfScenario = {
  name: string;
  route: string;
  runInteraction: (page: Page) => Promise<void>;
};

const budgets = {
  cls: 0.1,
  inp: 200,
  jsBytes: 170 * 1024,
  lcp: 2500
} as const;

const scenarios: PerfScenario[] = [
  {
    name: 'Homepage',
    route: '/',
    runInteraction: async (page) => {
      await page.getByRole('link', { name: /Browse all tools/i }).click();
    }
  },
  {
    name: 'UUID tool',
    route: '/tools/uuid',
    runInteraction: async (page) => {
      await page.getByRole('button', { name: /Generate UUID/i }).click();
    }
  },
  {
    name: 'Base64 tool',
    route: '/tools/base64',
    runInteraction: async (page) => {
      await page.getByLabel(/Plain text/i).fill('hello devswiss.tools');
      await page.getByRole('button', { name: /Encode text/i }).click();
    }
  },
  {
    name: 'Hash tool',
    route: '/tools/hash',
    runInteraction: async (page) => {
      await page.getByLabel(/Plain text/i).fill('hello devswiss.tools');
      await page.getByRole('button', { name: /Generate hash/i }).click();
    }
  },
  {
    name: 'Cron tool',
    route: '/tools/cron',
    runInteraction: async (page) => {
      await page.getByLabel(/^Seconds/i).selectOption('0');
      await page.getByLabel(/^Minutes/i).selectOption('*/5');
      await page.getByLabel(/^Hours/i).selectOption('*');
      await page.getByLabel(/^Day of month/i).selectOption('*');
      await page.getByLabel(/^Month/i).selectOption('*');
      await page.getByLabel(/^Day of week/i).selectOption('*');
      await page.getByRole('button', { name: /Generate cron expression/i }).click();
    }
  }
];

function round(value: number, precision = 2) {
  return Number(value.toFixed(precision));
}

function measureBuildPayloadGzipBytes() {
  const repoRoot = process.cwd();
  const nextRoot = path.join(repoRoot, '.next');
  const manifestPath = path.join(nextRoot, 'server/app/page/build-manifest.json');
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, 'utf8')
  ) as {
    polyfillFiles?: string[];
    rootMainFiles?: string[];
  };
  const files = [...(manifest.rootMainFiles ?? []), ...(manifest.polyfillFiles ?? [])];

  return files.reduce((total, relativePath) => {
    const absolutePath = path.join(nextRoot, relativePath);
    const content = fs.readFileSync(absolutePath);

    return total + zlib.gzipSync(content, { level: 9 }).byteLength;
  }, 0);
}

test.describe('Performance budgets', () => {
  test.skip(!process.env.CI, 'Run performance budgets against production build only (CI mode).');
  test.skip(({ browserName }) => browserName !== 'chromium', 'INP event entries are measured on Chromium.');

  test('keeps route metrics within performance budgets', async ({ browser }) => {
    const context = await browser.newContext();
    const results: Array<{ name: string; route: string } & PerfMetrics> = [];
    const buildPayloadGzipBytes = measureBuildPayloadGzipBytes();

    for (const scenario of scenarios) {
      const page = await context.newPage();

      await page.addInitScript(() => {
        const metrics = { cls: 0, inp: 0, lcp: 0 };
        const store = window as Window & {
          __devswissToolsVitals?: {
            cls: number;
            inp: number;
            lcp: number;
          };
        };

        store.__devswissToolsVitals = metrics;

        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const latestEntry = entries.at(-1);

            if (latestEntry && latestEntry.startTime > metrics.lcp) {
              metrics.lcp = latestEntry.startTime;
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          metrics.lcp = 0;
        }

        try {
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
              if (!entry.hadRecentInput && entry.value) {
                metrics.cls += entry.value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch {
          metrics.cls = 0;
        }

        try {
          if (PerformanceObserver.supportedEntryTypes?.includes('event')) {
            new PerformanceObserver((entryList) => {
              for (const entry of entryList.getEntries() as Array<PerformanceEntry & { duration: number; interactionId: number }>) {
                if (entry.interactionId > 0 && entry.duration > metrics.inp) {
                  metrics.inp = entry.duration;
                }
              }
            }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit & {
              durationThreshold: number;
            });
          }
        } catch {
          metrics.inp = 0;
        }
      });

      await page.goto(scenario.route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await scenario.runInteraction(page);
      await page.waitForTimeout(450);

      const routeMetrics = await page.evaluate(() => {
        const store = window as Window & {
          __devswissToolsVitals?: {
            cls: number;
            inp: number;
            lcp: number;
          };
        };

        const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        const jsBytes = resourceEntries
          .filter((entry) => entry.name.includes('/_next/static/') || entry.initiatorType === 'script')
          .reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0);

        return {
          cls: store.__devswissToolsVitals?.cls ?? 0,
          inp: store.__devswissToolsVitals?.inp ?? 0,
          jsBytes,
          lcp: store.__devswissToolsVitals?.lcp ?? 0
        };
      });

      const normalizedMetrics: PerfMetrics = {
        cls: round(routeMetrics.cls, 3),
        inp: round(routeMetrics.inp, 1),
        jsBytes: Math.round(routeMetrics.jsBytes),
        lcp: round(routeMetrics.lcp, 1)
      };

      results.push({
        name: scenario.name,
        route: scenario.route,
        ...normalizedMetrics
      });

      expect(normalizedMetrics.lcp).toBeLessThanOrEqual(budgets.lcp);
      expect(normalizedMetrics.cls).toBeLessThanOrEqual(budgets.cls);

      // INP can remain 0 in lab runs if no qualifying interaction event is emitted.
      if (normalizedMetrics.inp > 0) {
        expect(normalizedMetrics.inp).toBeLessThanOrEqual(budgets.inp);
      }

      await page.close();
    }

    for (const result of results) {
      console.log(
        `[perf] ${result.name} ${result.route} lcp_ms=${result.lcp} cls=${result.cls} inp_ms=${result.inp} js_kb=${round(result.jsBytes / 1024, 1)}`
      );
    }
    console.log(`[perf] build_initial_js_gzip_kb=${round(buildPayloadGzipBytes / 1024, 1)}`);
    expect(buildPayloadGzipBytes).toBeLessThanOrEqual(budgets.jsBytes);

    await context.close();
  });
});
