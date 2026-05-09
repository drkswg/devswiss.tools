import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/json-ld';
import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { CronTool } from '@/components/tools/cron/cron-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata, buildToolSeoSummary } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';
import { buildToolStructuredData } from '@/lib/tools/structured-data';

const tool = getRequiredToolBySlug('cron');
const seoSummary = buildToolSeoSummary(tool);
const structuredData = buildToolStructuredData(tool);

export const metadata: Metadata = buildToolMetadata(tool);

export default function CronPage() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/timestamp" variant="outline">
            Next: Timestamp
          </Button>
        </>
      }
      description={tool.description}
      seoSummary={seoSummary}
      title={tool.name}
    >
      <JsonLd data={structuredData} id="cron-structured-data" />
      <CronTool />
    </ToolPageShell>
  );
}
