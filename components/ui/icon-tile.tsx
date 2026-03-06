import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AccentToken } from '@/lib/tools/contracts';

import styles from './icon-tile.module.css';

type IconTileProps = {
  accent: AccentToken;
  category?: string;
  description: string;
  href: string;
  icon: ReactNode;
  title: string;
};

export function IconTile({
  accent,
  category = 'Developer Utility',
  description,
  href,
  icon,
  title
}: Readonly<IconTileProps>) {
  return (
    <Link aria-label={`Open ${title}`} className={styles.tile} data-accent={accent} href={href}>
      <span aria-hidden className={styles.iconWrap}>
        {icon}
      </span>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          <ArrowUpRight aria-hidden size={20} />
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.meta}>
        <span className={styles.badge}>{category}</span>
        <span className={styles.linkText}>Open tool</span>
      </div>
    </Link>
  );
}
