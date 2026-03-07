import type { Metadata } from 'next';

import { Hero } from '@/components/marketing/hero';
import { ToolCatalog } from '@/components/marketing/tool-catalog';
import { siteDescription, siteName } from '@/lib/tools/metadata';
import { getAllTools } from '@/lib/tools/registry';

const homepageTools = getAllTools();
const homepageKeywords = Array.from(new Set(homepageTools.flatMap((tool) => tool.keywords)));

const mainStyles = {
  display: 'grid',
  gap: 'clamp(2.25rem, 5vw, 3.25rem)',
  paddingBlock: 'clamp(1.5rem, 4vw, 2.5rem) clamp(3rem, 8vw, 5rem)'
} as const;

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  keywords: homepageKeywords,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: '/'
  }
};

export default function HomePage() {
  return (
    <main className="site-shell" style={mainStyles}>
      <Hero />
      <ToolCatalog
        description="Generate UUIDs, encode Base64 text, create hashes, and build cron expressions directly in the browser."
        eyebrow="Core Utilities"
        id="tool-catalog"
        title=""
        tools={homepageTools}
      />
    </main>
  );
}