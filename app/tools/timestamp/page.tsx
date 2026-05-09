import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/json-ld';
import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { TimestampTool } from '@/components/tools/timestamp/timestamp-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata, buildToolSeoSummary } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';
import { buildToolStructuredData } from '@/lib/tools/structured-data';

const tool = getRequiredToolBySlug('timestamp');
const seoSummary = buildToolSeoSummary(tool);
const structuredData = buildToolStructuredData(tool);

export const metadata: Metadata = buildToolMetadata(tool);

export default function TimestampPage() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/regex" variant="outline">
            Next: Regex
          </Button>
        </>
      }
      description={tool.description}
      seoSummary={seoSummary}
      title={tool.name}
    >
      <JsonLd data={structuredData} id="timestamp-structured-data" />
      <TimestampTool />
    </ToolPageShell>
  );
}
