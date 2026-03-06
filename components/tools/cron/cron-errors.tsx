'use client';

import { StatusMessage } from '@/components/ui/status-message';

import styles from './cron-builder.module.css';

type CronErrorsProps = {
  errors?: string[];
};

export function CronErrors({ errors = [] }: Readonly<CronErrorsProps>) {
  if (errors.length === 0) {
    return null;
  }

  const uniqueErrors = Array.from(new Set(errors));

  return (
    <StatusMessage title="Resolve these schedule issues before generating." tone="error">
      <ul className={styles.errorList}>
        {uniqueErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </StatusMessage>
  );
}
