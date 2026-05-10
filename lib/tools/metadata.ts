import type { Metadata, Viewport } from 'next';

import type { ToolDefinition } from '@/lib/tools/contracts';

export const siteName = 'Developer\'s Swiss Tool';
export const siteUrl = 'https://devswiss.tools';
export const siteDescription =
  'Elegant browser-first utilities for UUIDs, Base64 transforms, XML formatting, hashing, and cron expression workflows.';
export const siteIconPath = '/icon.png';
export const siteOgImagePath = siteIconPath;

export const siteMetadata: Metadata = {
  applicationName: siteName,
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
      'developer tools', 'uuid', 'base64', 'xml formatter', 'hash generator', 'cron expression', 'bcryp hash generator',
      'timestamp converter', 'regex tester', 'timestamp', 'regex', 'hash', 'bcrypt', 'cron', 'xml', 'regexp'
  ],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: siteIconPath,
    shortcut: siteIconPath,
    apple: siteIconPath
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    images: [siteOgImagePath],
    siteName,
    type: 'website',
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [siteOgImagePath]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
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

export function buildCanonicalUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return new URL(normalizedPath, siteUrl).toString();
}

export function buildToolSeoSummary(
  tool: Pick<ToolDefinition, 'description' | 'name' | 'supportedActions'>
): string {
  const actionLabels = tool.supportedActions.map((action) => action.label.toLowerCase());
  const actionSummary =
    actionLabels.length > 0
      ? ` It supports ${new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(actionLabels)} without sending inputs to a server.`
      : ' It runs entirely in the browser without sending inputs to a server.';

  return `${tool.name} is a browser-local utility for developer workflows. ${tool.description}${actionSummary}`;
}

export function buildToolMetadata(
  tool: Pick<ToolDefinition, 'description' | 'name' | 'routePath' | 'slug'> & Pick<Partial<ToolDefinition>, 'keywords'>
): Metadata {
  const canonicalRoute = deriveToolRoutePath(tool);
  const title = `${tool.name} | ${siteName}`;

  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords ?? [],
    alternates: {
      canonical: canonicalRoute
    },
    openGraph: {
      title,
      description: tool.description,
      images: [siteOgImagePath],
      url: canonicalRoute,
      siteName,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: tool.description,
      images: [siteOgImagePath]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    }
  };
}
