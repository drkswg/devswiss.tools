import type { NextConfig } from 'next';

const isGithubPagesBuild = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath = isGithubPagesBuild && repoName ? `/${repoName}` : '';

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
