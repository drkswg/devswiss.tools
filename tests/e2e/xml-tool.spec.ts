import { expect, test } from '@/tests/e2e/fixtures';

const compactXml = '<root><item id="1">alpha</item><item id="2"><name>beta</name></item></root>';

test.describe('XML formatter tool', () => {
  test('formats XML in a two-pane desktop layout and downloads XML output', async ({ page, runAxe }) => {
    await page.goto('/tools/xml');

    const sourceWorkflow = page.getByRole('region', { name: /XML source workflow/i });
    const outputWorkflow = page.getByRole('region', { name: /XML output workflow/i });
    const sourceBox = await sourceWorkflow.boundingBox();
    const outputBox = await outputWorkflow.boundingBox();

    expect(sourceBox).not.toBeNull();
    expect(outputBox).not.toBeNull();
    expect((sourceBox?.x ?? 0) < (outputBox?.x ?? 0)).toBe(true);

    await page.getByLabel(/Original XML/i).fill(compactXml);
    await page.getByLabel(/Format indentation/i).selectOption('4');
    await page.getByRole('button', { name: /Format XML/i }).click();

    await expect(page.getByText(/XML formatted with 4-space indentation/i)).toBeVisible();
    await expect(page.getByLabel(/Transformed output/i)).toHaveValue(
      ['<root>', '    <item id="1">alpha</item>', '    <item id="2">', '        <name>beta</name>', '    </item>', '</root>'].join(
        '\n'
      )
    );

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download XML/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('formatted.xml');
    await runAxe('main');
  });

  test('uploads XML and converts it to JSON', async ({ page, runAxe }) => {
    await page.goto('/tools/xml');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'sample.xml',
      mimeType: 'application/xml',
      buffer: Buffer.from(compactXml, 'utf-8')
    });

    await expect(page.getByText(/XML file loaded/i)).toBeVisible();
    await page.getByRole('button', { name: /XML to JSON/i }).click();

    await expect(page.getByText(/XML converted to JSON/i)).toBeVisible();
    await expect(page.getByLabel(/Transformed output/i)).toHaveValue(`{
  "root": {
    "item": [
      {
        "@attributes": {
          "id": "1"
        },
        "#text": "alpha"
      },
      {
        "@attributes": {
          "id": "2"
        },
        "name": "beta"
      }
    ]
  }
}`);
    await expect(page.getByRole('button', { name: /Download XML/i })).toHaveCount(0);
    await runAxe('main');
  });

  test('stacks the XML source and output workflows on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1200 });
    await page.goto('/tools/xml');

    const sourceWorkflow = page.getByRole('region', { name: /XML source workflow/i });
    const outputWorkflow = page.getByRole('region', { name: /XML output workflow/i });
    const sourceBox = await sourceWorkflow.boundingBox();
    const outputBox = await outputWorkflow.boundingBox();

    expect(sourceBox).not.toBeNull();
    expect(outputBox).not.toBeNull();
    expect(Math.abs((sourceBox?.x ?? 0) - (outputBox?.x ?? 0)) < 8).toBe(true);
    expect((sourceBox?.y ?? 0) < (outputBox?.y ?? 0)).toBe(true);
  });
});
