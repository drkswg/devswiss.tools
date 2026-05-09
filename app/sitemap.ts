import type { MetadataRoute } from 'next';

import { buildCanonicalUrl } from '@/lib/tools/metadata';
import { getAllTools } from '@/lib/tools/registry';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: MetadataRoute.Sitemap = [
    {
      changeFrequency: 'weekly' as const,
      lastModified,
      priority: 1,
      url: buildCanonicalUrl('/')
    },
    ...getAllTools()
      .filter((tool) => tool.status === 'active')
      .map((tool) => ({
        changeFrequency: 'monthly' as const,
        lastModified,
        priority: 0.8,
        url: buildCanonicalUrl(tool.routePath)
      }))
  ];

  return routes;
}
