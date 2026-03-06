'use client';

import { useState } from 'react';

import { buildCronExpression, type CronProcessorResult } from '@/lib/tools/processors/cron';
import { copyTextToClipboard } from '@/lib/utils/clipboard';
import type { FieldErrors } from '@/lib/validation/common';
import { emptyCronDraft, type CronDraft, type CronFieldKey } from '@/lib/validation/cron';

import { CronBuilder } from './cron-builder';
import styles from './cron-builder.module.css';
import { CronErrors } from './cron-errors';
import { CronSummary } from './cron-summary';

type CopyFeedback = {
  description?: string;
  title: string;
  tone: 'error' | 'info' | 'success' | 'warning';
};

const idleResult: CronProcessorResult = {
  state: 'valid',
  message: 'Choose each cron field to generate an expression.'
};

function removeFieldError(fieldErrors: FieldErrors, field: CronFieldKey) {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([key]) => key !== field)
  );
}

export function CronTool() {
  const [draft, setDraft] = useState<CronDraft>(emptyCronDraft);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CronProcessorResult>(idleResult);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFieldChange(field: CronFieldKey, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => removeFieldError(previous, field));
    setCopyFeedback(null);
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

  return (
    <div className={styles.layout}>
      <CronBuilder
        draft={draft}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
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
    </div>
  );
}
