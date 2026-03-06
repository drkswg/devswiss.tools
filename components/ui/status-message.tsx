import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CircleCheckBig, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import styles from './status-message.module.css';

type StatusTone = 'info' | 'success' | 'warning' | 'error';

type StatusMessageProps = {
  children?: ReactNode;
  icon?: LucideIcon;
  title: string;
  tone?: StatusTone;
};

const defaultIcons: Record<StatusTone, LucideIcon> = {
  info: Info,
  success: CircleCheckBig,
  warning: TriangleAlert,
  error: AlertCircle
};

export function StatusMessage({
  children,
  icon,
  title,
  tone = 'info'
}: Readonly<StatusMessageProps>) {
  const Icon = icon ?? defaultIcons[tone];
  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <div aria-live="polite" className={styles.message} data-tone={tone} role={role}>
      <Icon aria-hidden className={styles.icon} size={18} />
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
    </div>
  );
}
