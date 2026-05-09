import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { buildCanonicalUrl, buildToolMetadata, buildToolSeoSummary, siteUrl } from '@/lib/tools/metadata';
import { getAllTools, getRequiredToolBySlug } from '@/lib/tools/registry';
import { buildHomepageStructuredData, buildToolStructuredData } from '@/lib/tools/structured-data';

describe('SEO metadata helpers', () => {
  it('builds absolute canonical URLs on the production host', () => {
    expect(buildCanonicalUrl('/tools/uuid')).toBe(`${siteUrl}/tools/uuid`);
    expect(buildCanonicalUrl('tools/base64')).toBe(`${siteUrl}/tools/base64`);
  });

  it('enriches tool metadata with canonical, social, keyword, and robots fields', () => {
    const tool = getRequiredToolBySlug('uuid');
    const metadata = buildToolMetadata(tool);

    expect(metadata.alternates?.canonical).toBe('/tools/uuid');
    expect(metadata.keywords).toEqual(tool.keywords);
    expect(metadata.openGraph?.url).toBe('/tools/uuid');
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(metadata.robots).toMatchObject({ follow: true, index: true });
  });

  it('creates registry-driven SEO summaries for tool pages', () => {
    const tool = getRequiredToolBySlug('base64');

    expect(buildToolSeoSummary(tool)).toContain('Base64 Encoder & Decoder is a browser-local utility');
    expect(buildToolSeoSummary(tool)).toContain('without sending inputs to a server');
  });
});

describe('SEO metadata routes', () => {
  it('includes the homepage and every active tool route in the sitemap', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(`${siteUrl}/`);

    for (const tool of getAllTools().filter((entry) => entry.status === 'active')) {
      expect(urls).toContain(`${siteUrl}${tool.routePath}`);
    }
  });

  it('allows public crawling and exposes the canonical sitemap URL', () => {
    expect(robots()).toMatchObject({
      rules: {
        allow: '/',
        userAgent: '*'
      },
      sitemap: `${siteUrl}/sitemap.xml`
    });
  });
});

describe('JSON-LD builders', () => {
  it('describes the homepage as a website, organization, and tool item list', () => {
    const data = buildHomepageStructuredData(getAllTools());
    const itemList = data.find((entry) => entry['@type'] === 'ItemList');

    expect(data.map((entry) => entry['@type'])).toEqual(['WebSite', 'Organization', 'ItemList']);
    expect(itemList?.itemListElement).toHaveLength(getAllTools().length);
  });

  it('describes each tool as a free web application', () => {
    const tool = getRequiredToolBySlug('cron');
    const data = buildToolStructuredData(tool);

    expect(data).toMatchObject({
      '@type': 'WebApplication',
      applicationCategory: 'DeveloperApplication',
      isAccessibleForFree: true,
      name: tool.name,
      url: `${siteUrl}${tool.routePath}`
    });
  });
});
