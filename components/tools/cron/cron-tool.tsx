'use client';

import { useState } from 'react';

import { buildCronExpression, explainCronExpression, type CronProcessorResult } from '@/lib/tools/processors/cron';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import type { FieldErrors } from '@/lib/validation/common';
import { emptyCronDraft, type CronDraft, type CronFieldCount, type CronFieldKey } from '@/lib/validation/cron';

import { CronBuilder } from './cron-builder';
import styles from './cron-builder.module.css';
import { CronExplainer } from './cron-explainer';
import { CronErrors } from './cron-errors';
import { CronSummary } from './cron-summary';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const idleResult: CronProcessorResult = {
  state: 'valid',
  message: 'Choose a 5-field or 6-field format, then fill each cron field to generate an expression.'
};

const idleExplainResult: CronProcessorResult = {
  state: 'valid',
  message: 'Paste a 5-field or 6-field cron expression to explain its schedule.'
};

function removeFieldError(fieldErrors: FieldErrors, field: keyof CronDraft) {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([key]) => key !== field)
  );
}

export function CronTool() {
  const [draft, setDraft] = useState<CronDraft>(emptyCronDraft);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CronProcessorResult>(idleResult);
  const [expression, setExpression] = useState('');
  const [explainResult, setExplainResult] = useState<CronProcessorResult>(idleExplainResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  function handleFieldChange(field: CronFieldKey, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => removeFieldError(previous, field));
    setCopyFeedback(null);
  }

  function handleFieldCountChange(fieldCount: CronFieldCount) {
    setDraft((previous) => ({ ...previous, fieldCount }));
    setFieldErrors((previous) => removeFieldError(removeFieldError(previous, 'fieldCount'), 'seconds'));
    setResult(idleResult);
    setCopyFeedback(null);
  }

  function handleExpressionChange(value: string) {
    setExpression(value);
    setExplainResult((previous) => ({
      ...previous,
      fieldErrors: previous.fieldErrors
        ? Object.fromEntries(Object.entries(previous.fieldErrors).filter(([key]) => key !== 'expression'))
        : previous.fieldErrors
    }));
  }

  async function handleCopy() {
    const copyResult = await copyTextToClipboard(result.expression ?? '');

    if (copyResult.ok) {
      setCopyFeedback({
        tone: 'success',
        title: 'Copied to clipboard',
        description: 'The cron expression is ready to paste.'
      });
      return;
    }

    setCopyFeedback({
      tone: 'error',
      title: 'Copy unavailable',
      description:
        copyResult.reason === 'blocked'
          ? 'The browser blocked clipboard access. Copy the expression manually.'
          : 'Clipboard access is not available in this environment.'
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextResult = buildCronExpression(draft);
      setFieldErrors(nextResult.fieldErrors ?? {});
      setResult(nextResult);
      setCopyFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleExplainSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsExplaining(true);

    try {
      const nextResult = explainCronExpression(expression);
      setExplainResult(nextResult);
    } finally {
      setIsExplaining(false);
    }
  }

  return (
    <div className={styles.layout}>
      <section aria-label="Cron builder workflow" className={styles.workflowColumn}>
        <CronBuilder
          draft={draft}
          fieldErrors={fieldErrors}
          isSubmitting={isSubmitting}
          onFieldCountChange={handleFieldCountChange}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
        />
        <CronErrors errors={result.errors} />
        <CronSummary
          copyFeedback={copyFeedback}
          expression={result.expression}
          humanSummary={result.humanSummary}
          onCopy={result.state === 'valid' && result.expression ? handleCopy : undefined}
          state={result.state}
          statusTitle={result.message}
        />
      </section>

      <section aria-label="Cron explainer workflow" className={styles.workflowColumn}>
        <CronExplainer
          expression={expression}
          isSubmitting={isExplaining}
          onExpressionChange={handleExpressionChange}
          onSubmit={handleExplainSubmit}
          result={explainResult}
        />
      </section>
    </div>
  );
}
