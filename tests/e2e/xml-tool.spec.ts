import { expect, test } from '@/tests/e2e/fixtures';

const compactXml = '<root><item id="1">alpha</item><item id="2"><name>beta</name></item></root>';

test.describe('XML formatter tool', () => {
  test('formats XML in a two-pane desktop layout and downloads XML output', async ({ page, runAxe }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/tools/xml');

    const sourceWorkflow = page.getByRole('region', { name: /XML source workflow/i });
    const outputWorkflow = page.getByRole('region', { name: /XML output workflow/i });
    const sourceTextarea = page.getByLabel(/Original XML/i);
    const outputTextarea = page.getByLabel(/Transformed output/i);
    const sourceBox = await sourceWorkflow.boundingBox();
    const outputBox = await outputWorkflow.boundingBox();
    const sourceTextareaBox = await sourceTextarea.boundingBox();
    const outputTextareaBox = await outputTextarea.boundingBox();

    expect(sourceBox).not.toBeNull();
    expect(outputBox).not.toBeNull();
    expect(sourceTextareaBox).not.toBeNull();
    expect(outputTextareaBox).not.toBeNull();
    expect((sourceBox?.x ?? 0) < (outputBox?.x ?? 0)).toBe(true);
    expect((sourceBox?.width ?? 0) > 700).toBe(true);
    expect((outputBox?.width ?? 0) > 700).toBe(true);
    expect(Math.abs((sourceTextareaBox?.y ?? 0) - (outputTextareaBox?.y ?? 0)) < 8).toBe(true);
    expect(Math.abs((sourceTextareaBox?.height ?? 0) - (outputTextareaBox?.height ?? 0)) < 8).toBe(true);
    expect((sourceTextareaBox?.height ?? 0) > 420).toBe(true);
    expect((outputTextareaBox?.height ?? 0) > 420).toBe(true);

    await sourceTextarea.fill(compactXml);
    await page.getByLabel(/Format indentation/i).selectOption('4');
    await page.getByRole('button', { name: /Format XML/i }).click();

    await expect(page.getByText(/XML formatted with 4-space indentation/i)).toBeVisible();
    await expect(outputTextarea).toHaveValue(
      ['<root>', '    <item id="1">alpha</item>', '    <item id="2">', '        <name>beta</name>', '    </item>', '</root>'].join(
        '\n'
      )
    );
    await expect(page.getByTestId('xml-source-highlight').locator('.tokenTagName').first()).toBeVisible();
    await expect(page.getByTestId('xml-output-highlight')).toHaveAttribute('data-highlight-language', 'xml');
    await expect(page.getByTestId('xml-output-highlight').locator('.tokenAttributeValue').first()).toBeVisible();

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
    await expect(page.getByTestId('xml-output-highlight')).toHaveAttribute('data-highlight-language', 'json');
    await expect(page.getByTestId('xml-output-highlight').locator('.tokenKey').first()).toBeVisible();
    await expect(page.getByTestId('xml-output-highlight').locator('.tokenString').nth(1)).toBeVisible();
    await runAxe('main');
  });

  test('stacks the XML source and output workflows on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1200 });
    await page.goto('/tools/xml');

    const sourceWorkflow = page.getByRole('region', { name: /XML source workflow/i });
    const outputWorkflow = page.getByRole('region', { name: /XML output workflow/i });
    const sourceTextarea = page.getByLabel(/Original XML/i);
    const outputTextarea = page.getByLabel(/Transformed output/i);
    const sourceBox = await sourceWorkflow.boundingBox();
    const outputBox = await outputWorkflow.boundingBox();
    const sourceTextareaBox = await sourceTextarea.boundingBox();
    const outputTextareaBox = await outputTextarea.boundingBox();

    expect(sourceBox).not.toBeNull();
    expect(outputBox).not.toBeNull();
    expect(sourceTextareaBox).not.toBeNull();
    expect(outputTextareaBox).not.toBeNull();
    expect(Math.abs((sourceBox?.x ?? 0) - (outputBox?.x ?? 0)) < 8).toBe(true);
    expect((sourceBox?.y ?? 0) < (outputBox?.y ?? 0)).toBe(true);
    expect(Math.abs((sourceTextareaBox?.x ?? 0) - (outputTextareaBox?.x ?? 0)) < 8).toBe(true);
    expect((sourceTextareaBox?.y ?? 0) < (outputTextareaBox?.y ?? 0)).toBe(true);
    expect((sourceTextareaBox?.height ?? 0) > 300).toBe(true);
    expect((outputTextareaBox?.height ?? 0) > 300).toBe(true);
  });
});
