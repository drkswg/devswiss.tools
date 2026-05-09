import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/json-ld';
import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { XmlTool } from '@/components/tools/xml/xml-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata, buildToolSeoSummary } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';
import { buildToolStructuredData } from '@/lib/tools/structured-data';

const tool = getRequiredToolBySlug('xml');
const seoSummary = buildToolSeoSummary(tool);
const structuredData = buildToolStructuredData(tool);

export const metadata: Metadata = buildToolMetadata(tool);

export default function XmlPage() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/uuid" variant="outline">
            Next: UUID
          </Button>
        </>
      }
      description={tool.description}
      layoutWidth="wide"
      seoSummary={seoSummary}
      title={tool.name}
    >
      <JsonLd data={structuredData} id="xml-structured-data" />
      <XmlTool />
    </ToolPageShell>
  );
}
