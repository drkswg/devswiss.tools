import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/json-ld';
import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { RegexTool } from '@/components/tools/regex/regex-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata, buildToolSeoSummary } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';
import { buildToolStructuredData } from '@/lib/tools/structured-data';

const tool = getRequiredToolBySlug('regex');
const seoSummary = buildToolSeoSummary(tool);
const structuredData = buildToolStructuredData(tool);

export const metadata: Metadata = buildToolMetadata(tool);

export default function RegexPage() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/xml" variant="outline">
            Next: XML
          </Button>
        </>
      }
      description={tool.description}
      seoSummary={seoSummary}
      title={tool.name}
    >
      <JsonLd data={structuredData} id="regex-structured-data" />
      <RegexTool />
    </ToolPageShell>
  );
}
