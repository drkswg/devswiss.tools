import type { NextConfig } from 'next';

const isGithubPagesBuild = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const explicitPagesBasePath = process.env.PAGES_BASE_PATH;

function normalizeBasePath(value: string): string {
  if (!value || value === '/') {
    return '';
  }

  return value.startsWith('/') ? value : `/${value}`;
}

const basePath =
  explicitPagesBasePath !== undefined
    ? normalizeBasePath(explicitPagesBasePath)
    : isGithubPagesBuild && repoName
      ? `/${repoName}`
      : '';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    globalNotFound: true
  },
  basePath,
  assetPrefix: basePath
};

export default nextConfig;
