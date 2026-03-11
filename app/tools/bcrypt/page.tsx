import type { Metadata } from 'next';

import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { BcryptTool } from '@/components/tools/bcrypt/bcrypt-tool';
import { Button } from '@/components/ui/button';
import { buildToolMetadata } from '@/lib/tools/metadata';
import { getRequiredToolBySlug } from '@/lib/tools/registry';

const tool = getRequiredToolBySlug('bcrypt');

export const metadata: Metadata = buildToolMetadata(tool);

export default function BcryptPage() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      actions={
        <>
          <Button href="/" tone="neutral" variant="ghost">
            Back to catalog
          </Button>
          <Button href="/tools/cron" variant="outline">
            Next: Cron
          </Button>
        </>
      }
      description={tool.description}
      title={tool.name}
    >
      <BcryptTool />
    </ToolPageShell>
  );
}
