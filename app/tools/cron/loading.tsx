import { ToolPageShell } from '@/components/tool-shell/tool-page-shell';
import { getRequiredToolBySlug } from '@/lib/tools/registry';

const tool = getRequiredToolBySlug('cron');

export default function CronLoading() {
  return (
    <ToolPageShell
      accent={tool.accentToken}
      description={tool.description}
      title={tool.name}
    >
      <section
        aria-busy="true"
        aria-live="polite"
        className="surface-card"
        style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}
      >
        <p className="section-copy">Loading cron builder…</p>
      </section>
    </ToolPageShell>
  );
}
