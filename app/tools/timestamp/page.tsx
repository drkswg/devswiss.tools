import type { Metadata } from 'next';

import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { TimestampTool } from '@/components/tools/timestamp/timestamp-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';

const tool = getRequiredToolBySlug('timestamp');

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
          <Button href="/tools/xml" variant="outline">
            Next: XML
          </Button>
        </>
      }
      description={tool.description}
      title={tool.name}
    >
      <TimestampTool />
    </ToolPageShell>
  );
}
