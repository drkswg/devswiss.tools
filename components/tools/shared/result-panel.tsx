'use client';

import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusMessage } from '@/components/ui/status-message';
import type { ValidationState } from '@/lib/validation/common';

import styles from './result-panel.module.css';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

type ResultPanelProps = {
  copyFeedback?: CopyFeedback | null;
  copyLabel?: string;
  onCopy?: () => void | Promise<void>;
  resultLabel?: string;
  state: ValidationState;
  statusDescription?: string;
  statusTitle: string;
  tone?: 'error' | 'info' | 'success' | 'warning';
  value?: string;
};

function resolveTone(
  state: ValidationState,
  tone?: 'error' | 'info' | 'success' | 'warning'
): 'error' | 'info' | 'success' | 'warning' {
  if (tone) {
    return tone;
  }

  if (state === 'valid') {
    return 'success';
  }

  if (state === 'invalid' || state === 'error') {
    return 'error';
  }

  return 'info';
}

export function ResultPanel({
  copyFeedback = null,
  copyLabel = 'Copy result',
  onCopy,
  resultLabel = 'Result',
  state,
  statusDescription,
  statusTitle,
  tone,
  value
}: Readonly<ResultPanelProps>) {
  const resolvedTone = resolveTone(state, tone);
  const canCopy = Boolean(onCopy && value);

  return (
    <section aria-label={resultLabel} className={styles.panel}>
      <div className={styles.header}>
        <div className="section-heading">
          <span className="section-eyebrow">Output</span>
          <h2 className={styles.title}>{resultLabel}</h2>
        </div>
        {canCopy ? (
          <Button className={styles.copyButton} onClick={onCopy} tone="neutral" variant="ghost">
            <Copy aria-hidden size={16} />
            {copyLabel}
          </Button>
        ) : null}
      </div>

      <StatusMessage title={statusTitle} tone={resolvedTone}>
        {statusDescription ? <p>{statusDescription}</p> : null}
      </StatusMessage>

      <div aria-live="polite" className={styles.output}>
        {value ? (
          <pre className={styles.value} tabIndex={0}>
            <code>{value}</code>
          </pre>
        ) : (
          <p className={styles.placeholder}>No result yet. Submit the current tool action to populate this panel.</p>
        )}
      </div>

      {copyFeedback ? (
        <StatusMessage title={copyFeedback.title} tone={copyFeedback.tone}>
          {copyFeedback.description ? <p>{copyFeedback.description}</p> : null}
        </StatusMessage>
      ) : null}
    </section>
  );
}
