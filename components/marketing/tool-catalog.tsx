import type { ReactNode } from 'react';

import { IconTile } from '@/components/ui/icon-tile';
import { resolveToolIcon } from '@/lib/tools/icon-map';
import type { ToolDefinition } from '@/lib/tools/contracts';
import { deriveToolRoutePath } from '@/lib/tools/metadata';
import { getAllTools } from '@/lib/tools/registry';

import styles from './tool-catalog.module.css';

type ToolCatalogProps = {
  description?: string;
  eyebrow?: string;
  id?: string;
  title?: string;
  tools?: readonly ToolDefinition[];
};

export function ToolCatalog({
  description = 'Open browser-based utilities for UUIDs, Base64 text, XML formatting, hashes, and cron expressions.',
  eyebrow = 'Tool Catalog',
  id,
  title = 'Common developer utilities, available as direct routes.',
  tools = getAllTools()
}: Readonly<ToolCatalogProps>) {
  const resolvedTitle = title.trim() || 'Available developer tools';

  const catalogTools = [...tools].sort((left, right) => {
    const orderDiff = left.order - right.order;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return left.name.localeCompare(right.name);
  });

  if (catalogTools.length === 0) {
    return (
      <section className={styles.wrapper} id={id}>
        <div className="section-heading">
          <span className="section-eyebrow">{eyebrow}</span>
          <h2 className={title ? undefined : 'visually-hidden'}>{resolvedTitle}</h2>
          {description ? <p className="section-copy">{description}</p> : null}
        </div>
        <div className={styles.empty}>No tools are available yet.</div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper} id={id}>
      <div className="section-heading">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 className={title ? undefined : 'visually-hidden'}>{resolvedTitle}</h2>
        {description ? <p className="section-copy">{description}</p> : null}
      </div>
      <div className={styles.grid}>
        {catalogTools.map((tool) => {
          const Icon = resolveToolIcon(tool.iconKey);
          const icon: ReactNode = <Icon aria-hidden size={34} strokeWidth={1.8} />;

          return (
            <IconTile
              accent={tool.accentToken}
              category={tool.category}
              description={tool.description}
              href={deriveToolRoutePath(tool)}
              icon={icon}
              key={tool.id}
              title={tool.name}
            />
          );
        })}
      </div>
    </section>
  );
}
