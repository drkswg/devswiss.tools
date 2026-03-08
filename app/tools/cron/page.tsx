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
      helperText='Generate six-field cron expressions with seconds. A fixed hour with "*" minutes and seconds means the whole hour, while a single daily run needs explicit seconds and minutes such as "0 0 0 * * *".'
      title={tool.name}
    >
      <CronTool />
    </ToolPageShell>
  );
}
