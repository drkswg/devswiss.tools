'use client';

import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ResultPanel } from '@/components/tools/shared/result-panel';
import type { CronProcessorResult } from '@/lib/tools/processors/cron';

import { CronErrors } from './cron-errors';
import styles from './cron-builder.module.css';

type CronExplainerProps = {
  expression: string;
  isSubmitting: boolean;
  onExpressionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  result: CronProcessorResult;
};

function describedBy(error?: string) {
  return ['cron-expression-input-hint', error ? 'cron-expression-input-error' : null].filter(Boolean).join(' ') || undefined;
}

export function CronExplainer({
  expression,
  isSubmitting,
  onExpressionChange,
  onSubmit,
  result
}: Readonly<CronExplainerProps>) {
  const expressionError = result.fieldErrors?.expression?.[0];
  const summaryState = result.humanSummary ? 'valid' : 'idle';

  return (
    <>
      <div className={styles.panelHeader}>
        <div className="section-heading">
          <span className="section-eyebrow">Cron explainer</span>
          <h2>Explain a 5-field or 6-field cron expression</h2>
          <p className="section-copy">
            Paste an existing cron expression to see its normalized schedule and a plain-language explanation.
          </p>
        </div>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <FormField
          error={expressionError}
          hint='Enter a 5-field expression such as "*/15 * * * *" or a 6-field expression such as "0 */15 * * * *".'
          htmlFor="cron-expression-input"
          label="Cron expression"
          required
        >
          <textarea
            aria-describedby={describedBy(expressionError)}
            className={styles.expressionInput}
            id="cron-expression-input"
            onChange={(event) => onExpressionChange(event.target.value)}
            placeholder="0 */15 * * * *"
            rows={4}
            value={expression}
          />
        </FormField>

        <div className={styles.actions}>
          <Button type="submit">
            {isSubmitting ? 'Explaining...' : 'Explain cron expression'}
          </Button>
        </div>
      </form>

      <CronErrors errors={result.errors} />

      <ResultPanel
        resultLabel="Normalized cron expression"
        state={result.state === 'valid' && !result.expression ? 'idle' : result.state}
        statusTitle={result.message}
        value={result.expression}
      />

      <section aria-label="Cron explanation summary" className={styles.summaryPanel}>
        <h3 className={styles.summaryTitle}>Readable explanation</h3>
        <p className={styles.summaryText} data-state={summaryState}>
          {result.humanSummary ?? 'Explain a valid cron expression to preview the schedule in plain language.'}
        </p>
      </section>
    </>
  );
}
