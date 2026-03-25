import type { ReactNode } from 'react';

import type { AccentToken } from '@/lib/tools/contracts';

import styles from './tool-page-shell.module.css';

type ToolPageShellProps = {
  actions?: ReactNode;
  accent: AccentToken;
  children: ReactNode;
  description: string;
  eyebrow?: string;
  layoutWidth?: 'default' | 'wide';
  title: string;
};

export function ToolPageShell({
  actions,
  accent,
  children,
  description,
  eyebrow = 'Developer Utility',
  layoutWidth = 'default',
  title
}: Readonly<ToolPageShellProps>) {
  return (
    <main className={`site-shell ${styles.shell}`} data-layout-width={layoutWidth}>
      <section className={`surface-card ${styles.header}`} data-accent={accent}>
        <div className={styles.headerTop}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <div className="section-heading">
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </section>
      <section className={styles.content}>{children}</section>
    </main>
  );
}
