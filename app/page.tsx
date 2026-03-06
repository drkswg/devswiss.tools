import type { Metadata } from 'next';

import { Hero } from '@/components/marketing/hero';
import { ToolCatalog } from '@/components/marketing/tool-catalog';
import { siteDescription, siteName } from '@/lib/tools/metadata';
import { getAllTools } from '@/lib/tools/registry';

const homepageTools = getAllTools();
const homepageKeywords = Array.from(new Set(homepageTools.flatMap((tool) => tool.keywords)));

const mainStyles = {
  paddingBlock: 'clamp(1.5rem, 4vw, 2.5rem) clamp(3rem, 8vw, 5rem)'
} as const;

const catalogSectionStyles = {
  marginTop: 'clamp(2.25rem, 5vw, 3.25rem)'
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
      <section style={catalogSectionStyles}>
        <ToolCatalog
          description="Open the tool you need directly from the homepage. Each entry follows the same tile pattern so future additions stay predictable."
          eyebrow="Core Utilities"
          id="tool-catalog"
          title="Four core tools, each available as a direct route."
          tools={homepageTools}
        />
      </section>
    </main>
  );
}
