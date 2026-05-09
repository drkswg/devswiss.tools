import type { MetadataRoute } from 'next';

import { siteIconPath } from '@/lib/tools/metadata';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'devswiss.tools',
    short_name: 'devswiss.tools',
    description:
      'Browser-first developer utilities for UUIDs, Base64, hashes, bcrypt, cron, timestamps, regex, and XML.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e1f22',
    theme_color: '#1e1f22',
    icons: [
      {
        src: siteIconPath,
        sizes: '1024x1024',
        type: 'image/png'
      }
    ],
    categories: ['developer', 'productivity', 'utilities'],
    lang: 'en',
    orientation: 'portrait-primary'
  };
}
