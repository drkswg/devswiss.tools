import type { ToolDefinition } from '@/lib/tools/contracts';
import { buildCanonicalUrl, deriveToolRoutePath, siteDescription, siteIconPath, siteName, siteUrl } from '@/lib/tools/metadata';

type JsonLdNode = Record<string, unknown>;

export function buildHomepageStructuredData(tools: readonly ToolDefinition[]): JsonLdNode[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      publisher: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: buildCanonicalUrl(siteIconPath)
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: buildCanonicalUrl(siteIconPath)
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${siteName} developer tools`,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: buildCanonicalUrl(deriveToolRoutePath(tool))
      }))
    }
  ];
}

export function buildToolStructuredData(tool: ToolDefinition): JsonLdNode {
  const routePath = deriveToolRoutePath(tool);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript and a modern browser.',
    description: tool.description,
    url: buildCanonicalUrl(routePath),
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl
    }
  };
}

