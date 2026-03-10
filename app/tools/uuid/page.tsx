import type { Metadata } from 'next';

import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { UuidTool } from '@/components/tools/uuid/uuid-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';

const tool = getRequiredToolBySlug('uuid');

export const metadata: Metadata = buildToolMetadata(tool);

export default function UuidPage() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/base64" variant="outline">
            Next: Base64
          </Button>
        </>
      }
      description={tool.description}
      title={tool.name}
    >
      <UuidTool />
    </ToolPageShell>
  );
}
