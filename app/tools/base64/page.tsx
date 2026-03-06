import type { Metadata } from 'next';

import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { Base64Tool } from '@/components/tools/base64/base64-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';

const tool = getRequiredToolBySlug('base64');

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
      helperText="Encode or decode text safely, including Unicode input. Invalid Base64 stays visible and returns clear guidance."
      title={tool.name}
    >
      <Base64Tool />
    </ToolPageShell>
  );
}
