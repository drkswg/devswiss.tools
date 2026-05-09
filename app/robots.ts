import type { MetadataRoute } from 'next';

import { buildCanonicalUrl } from '@/lib/tools/metadata';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: '/',
      userAgent: '*'
    },
    sitemap: buildCanonicalUrl('/sitemap.xml')
  };
}

