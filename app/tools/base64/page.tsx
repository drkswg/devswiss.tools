import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/json-ld';
import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { Base64Tool } from '@/components/tools/base64/base64-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata, buildToolSeoSummary } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';
import { buildToolStructuredData } from '@/lib/tools/structured-data';

const tool = getRequiredToolBySlug('base64');
const seoSummary = buildToolSeoSummary(tool);
const structuredData = buildToolStructuredData(tool);

export const metadata: Metadata = buildToolMetadata(tool);

export default function Base64Page() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/hash" variant="outline">
            Next: Hash
          </Button>
        </>
      }
      description={tool.description}
      seoSummary={seoSummary}
      title={tool.name}
    >
      <JsonLd data={structuredData} id="base64-structured-data" />
      <Base64Tool />
    </ToolPageShell>
  );
}
