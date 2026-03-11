import type { Metadata, Viewport } from 'next';

import type { ToolDefinition } from '@/lib/tools/contracts';

export const siteName = 'DevTools';
export const siteDescription =
  'Elegant browser-first utilities for UUIDs, Base64 transforms, XML formatting, hashing, and cron expression workflows.';

export const siteMetadata: Metadata = {
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: ['developer tools', 'uuid', 'base64', 'xml formatter', 'hash generator', 'cron expression'],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: siteName,
    description: siteDescription,
    siteName,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription
  }
};

export const siteViewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1e1f22',
  width: 'device-width',
  initialScale: 1
};

const toolSlugPattern = /^[a-z0-9-]+$/;

function normalizeToolSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();

  if (!toolSlugPattern.test(normalized)) {
    return 'tool';
  }

  return normalized;
}

export function deriveToolRoutePath(tool: Pick<ToolDefinition, 'routePath' | 'slug'>): string {
  const fallback = `/tools/${normalizeToolSlug(tool.slug)}`;
  const trimmed = tool.routePath?.trim();

  if (!trimmed) {
    return fallback;
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  const routePath = normalized.length === 0 ? fallback : normalized;

  if (!routePath.startsWith('/tools/') || routePath === '/tools') {
    return fallback;
  }

  return routePath;
}

export function buildToolMetadata(tool: Pick<ToolDefinition, 'description' | 'name' | 'routePath' | 'slug'>): Metadata {
  const canonicalRoute = deriveToolRoutePath(tool);

  return {
    title: tool.name,
    description: tool.description,
    alternates: {
      canonical: canonicalRoute
    },
    openGraph: {
      title: `${tool.name} | ${siteName}`,
      description: tool.description,
      url: canonicalRoute,
      siteName,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} | ${siteName}`,
      description: tool.description
    }
  };
}
