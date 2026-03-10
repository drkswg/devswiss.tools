import type { Metadata } from 'next';

import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { CronTool } from '@/components/tools/cron/cron-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';

const tool = getRequiredToolBySlug('cron');

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
          <Button href="/tools/uuid" variant="outline">
            Next: UUID
          </Button>
        </>
      }
      description={tool.description}
      title={tool.name}
    >
      <CronTool />
    </ToolPageShell>
  );
}
