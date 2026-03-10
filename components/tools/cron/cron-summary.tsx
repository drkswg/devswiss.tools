'use client';

import { ResultPanel } from '@/components/tools/shared/result-panel';
import type { ValidationState } from '@/lib/validation/common';

import styles from './cron-builder.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

type CronSummaryProps = {
  copyFeedback?: CopyFeedback | null;
  expression?: string;
  humanSummary?: string;
  onCopy?: () => void | Promise<void>;
  state: ValidationState;
  statusTitle: string;
};

export function CronSummary({
  copyFeedback = null,
  expression,
  humanSummary,
  onCopy,
  state,
  statusTitle
}: Readonly<CronSummaryProps>) {
  const resolvedState = state === 'valid' && !expression ? 'idle' : state;
  const summaryState = humanSummary ? 'valid' : 'idle';

  return (
    <div className={styles.summaryStack}>
      <ResultPanel
        copyFeedback={copyFeedback}
        onCopy={onCopy}
        resultLabel="Cron expression"
        state={resolvedState}
        statusTitle={statusTitle}
        value={expression}
      />

      <section aria-label="Readable schedule summary" className={styles.summaryPanel}>
        <h3 className={styles.summaryTitle}>Readable summary</h3>
        <p className={styles.summaryText} data-state={summaryState}>
          {humanSummary ?? 'Generate a valid expression to preview the readable schedule summary.'}
        </p>
      </section>
    </div>
  );
}
