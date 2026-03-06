import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevTools',
    short_name: 'DevTools',
    description: 'Browser-first developer utilities for UUIDs, Base64 transforms, hashes, and cron expressions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e1f22',
    theme_color: '#1e1f22',
    categories: ['developer', 'productivity', 'utilities'],
    lang: 'en',
    orientation: 'portrait-primary'
  };
}
